/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { FunctionComponent, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  PaginationVariant,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';

import Pagination from '../../../../Components/Pagination';

import { DEFAULT_NAMESPACE, useQueryParams } from '../../../../QueryParams';

import useRequest from '../../../../Utilities/useRequest';

import ApiStatusWrapper from '../../../../Components/ApiStatus/ApiStatusWrapper';
import FilterableToolbar from '../../../../Components/Toolbar/Toolbar';

import Chart from '../../../../Components/Chart';
import Table from './Table';
import DownloadButton from '../../../../Components/Toolbar/DownloadButton';
import { endpointFunctionMap, OptionsReturnType } from '../../../../Api';
import { capitalize } from '../../../../Utilities/helpers';
import { perPageOptions } from '../../Shared/constants';
import hydrateSchema from '../../Shared/hydrateSchema';
import { StandardProps } from '../types';
import percentageFormatter from '../../../../Utilities/percentageFormatter';
import { getDateFormatByGranularity } from '../../../../Utilities/helpers';
import {
  reportDefaultParams,
  specificReportDefaultParams,
} from '../../../../Utilities/constants';
import { useRedirect } from '../../../../QueryParams';
import paths from '../../paths';

const ReportCard: FunctionComponent<StandardProps> = ({
  slug,
  name,
  description,
  tableHeaders,
  expandedTableRowName,
  clickableLinking,
  showPagination,
  showKebab,
  defaultSelectedToolbarCategory = '',
  availableChartTypes,
  dataEndpoint,
  optionsEndpoint,
  schema,
  fullCard = true,
}) => {
  const readData = endpointFunctionMap(dataEndpoint);
  const readOptions = endpointFunctionMap(optionsEndpoint);
  const defaultParams = reportDefaultParams(slug);
  const { queryParams, setFromPagination, setFromToolbar } =
    useQueryParams(defaultParams);
  const { queryParams: settingsQueryParams, dispatch } = useQueryParams(
    {
      chartType: availableChartTypes[0],
    },
    'settings'
  );

  const { result: options, request: fetchOptions } =
    useRequest<OptionsReturnType>(readOptions, {});

  const { request: fetchData, ...dataApi } = useRequest(readData, {
    meta: { count: 0, legend: [] },
  });

  const redirect = useRedirect();

  const redirectToHostScatter = (
    slug: string,
    templateId: any,
    quickDateRange: any
  ) => {
    const initialQueryParams = {
      [DEFAULT_NAMESPACE]: {
        ...specificReportDefaultParams(slug),
        template_id: templateId,
        quick_date_range: quickDateRange,
      },
    };
    redirect(paths.getDetails(slug), initialQueryParams);
  };

  useEffect(() => {
    fetchData(queryParams);
    fetchOptions(queryParams);
  }, [queryParams]);

  /**
   * The function is used because the API is not returning the value.
   * When API gets support, this function should be removed.
   */
  const addTaskActionId = (
    qp: Record<string, string | string[]>
  ): Record<string, string | string[]> => {
    if (
      qp.task_action_name &&
      qp.task_action_id.length === 0 &&
      options?.task_action_id &&
      Array.isArray(qp.task_action_name)
    ) {
      const task_action_name = qp.task_action_name;
      const modules = options.task_action_id.filter((obj) =>
        task_action_name.includes(obj.value)
      );
      qp.task_action_id = modules.map((module) => module.key?.toString());
    }

    return qp;
  };

  /**
   * When API gets support, this effect should be removed.
   */
  useEffect(() => {
    // Pass the queryParams to the function making a copy so it is not mutated.
    fetchData(addTaskActionId(queryParams));
  }, [options?.task_action_id]);

  const chartParams = {
    y: queryParams.sort_options as string,
    label:
      options.sort_options?.find(({ key }) => key === queryParams.sort_options)
        ?.value || 'Label Y',
    xTickFormat: getDateFormatByGranularity(queryParams.granularity),
    chartType: settingsQueryParams.chartType || availableChartTypes[0],
  };

  const formattedValue = (key: string, value: number) => {
    let val;
    switch (key) {
      case 'average_duration_per_task':
        val = value.toFixed(2) + ' seconds';
        break;
      case 'slow_hosts_percentage':
        val = percentageFormatter(value) + '%';
        break;
      case 'template_success_rate':
        val = percentageFormatter(value) + '%';
        break;
      default:
        val = value.toFixed(2);
    }
    return val;
  };

  const handleClick = (event, props) => {
    redirectToHostScatter(
      'host_anomalies_scatter',
      props.datum.id,
      queryParams.quick_date_range
    );
    window.location.reload();
  };

  const customTooltipFormatting = ({ datum }) => {
    let tooltip;
    if (datum.host_status) {
      tooltip =
        'Host: ' +
        datum.host_name +
        '\nAverage duration per task: ' +
        formattedValue(queryParams.sortOptions, datum.y) +
        '\nHost status: ' +
        datum.host_status +
        '\nTotal tasks executed: ' +
        datum.total_tasks_executed +
        '\nLast Referenced: ' +
        datum.last_referenced +
        '\nSlow: ' +
        (datum.failed_duration > 0 && datum.successful_duration === -100
          ? 'True'
          : 'False');
    } else {
      tooltip =
        chartParams.label +
        ' for ' +
        datum.name +
        ': ' +
        formattedValue(queryParams.sort_options, datum.y);
    }
    return tooltip;
  };

  const getSortParams = (currKey: string) => {
    const onSort = (
      _event: unknown,
      index: number,
      direction: 'asc' | 'desc'
    ) => {
      setFromToolbar('sort_order', direction);
      setFromToolbar('sort_options', tableHeaders[index]?.key);
    };

    const whitelistKeys = options?.sort_options?.map(
      ({ key }: { key: string }) => key
    );
    if (!whitelistKeys?.includes(currKey)) return {};

    return {
      sort: {
        sortBy: {
          index:
            tableHeaders.findIndex(
              ({ key }) => key === queryParams.sort_options
            ) || 0,
          direction: queryParams.sort_order || 'none',
        },
        onSort,
        columnIndex: tableHeaders.findIndex(({ key }) => key === currKey),
      },
    };
  };

  const additionalControls = [
    availableChartTypes.length > 1 && (
      <ToggleGroup aria-label="Chart type toggle" key="chart-toggle">
        {availableChartTypes.map((chartType) => (
          <ToggleGroupItem
            key={chartType}
            data-cy={'chart_type'}
            text={`${capitalize(chartType)} Chart`}
            buttonId={chartType}
            isSelected={chartType === chartParams.chartType}
            onChange={() => {
              dispatch({ type: 'SET_CHART_TYPE', value: chartType });
            }}
          />
        ))}
      </ToggleGroup>
    ),
    <DownloadButton
      key="download-button"
      slug={slug}
      name={name}
      description={description}
      endpointUrl={dataEndpoint}
      queryParams={queryParams}
      selectOptions={options}
      y={chartParams.y}
      label={chartParams.label}
      xTickFormat={chartParams.xTickFormat}
      totalPages={Math.ceil(dataApi.result.meta.count / queryParams.limit)}
      pageLimit={queryParams.limit}
      chartType={chartParams.chartType}
      sortOptions={chartParams.y}
      sortOrder={queryParams.sort_order}
      dateGranularity={queryParams.granularity}
      startDate={queryParams.start_date}
      endDate={queryParams.end_date}
      dateRange={queryParams.quick_date_range}
    />,
  ];

  return fullCard ? (
    <Card data-cy={dataApi.isLoading ? 'toolbar_loading' : 'toolbar_loaded'}>
      <CardBody>
        <FilterableToolbar
          categories={options}
          defaultSelected={defaultSelectedToolbarCategory}
          filters={queryParams}
          setFilters={setFromToolbar}
          pagination={
            showPagination && (
              <Pagination
                count={dataApi.result.meta.count}
                perPageOptions={perPageOptions}
                params={{
                  limit: +queryParams.limit,
                  offset: +queryParams.offset,
                }}
                setPagination={setFromPagination}
                isCompact
              />
            )
          }
          additionalControls={additionalControls}
        />
        {tableHeaders && (
          <ApiStatusWrapper api={dataApi}>
            <Chart
              schema={hydrateSchema(schema)({
                label: chartParams.label,
                y: chartParams.y,
                xTickFormat: chartParams.xTickFormat,
                chartType: chartParams.chartType,
              })}
              dataComponent={'foobar'}
              data={dataApi.result}
              specificFunctions={{
                labelFormat: {
                  customTooltipFormatting,
                },
                onClick: {
                  handleClick,
                },
              }}
            />
            <Table
              legend={
                dataApi.result.meta.tableData
                  ? dataApi.result.meta.tableData
                  : dataApi.result.meta.legend
              }
              headers={tableHeaders}
              getSortParams={getSortParams}
              expandedRowName={expandedTableRowName}
              clickableLinking={clickableLinking}
              showKebab={showKebab}
            />
          </ApiStatusWrapper>
        )}
      </CardBody>
      <CardFooter>
        {showPagination && (
          <Pagination
            count={dataApi.result.meta.count}
            perPageOptions={perPageOptions}
            params={{
              limit: +queryParams.limit,
              offset: +queryParams.offset,
            }}
            setPagination={setFromPagination}
            variant={PaginationVariant.bottom}
          />
        )}
      </CardFooter>
    </Card>
  ) : (
    <div data-cy={dataApi.isLoading ? 'toolbar_loading' : 'toolbar_loaded'}>
      <FilterableToolbar
        categories={options}
        defaultSelected={defaultSelectedToolbarCategory}
        filters={queryParams}
        setFilters={setFromToolbar}
      />
      {tableHeaders && (
        <ApiStatusWrapper api={dataApi}>
          <Chart
            schema={hydrateSchema(schema)({
              label: chartParams.label,
              y: chartParams.y,
              xTickFormat: chartParams.xTickFormat,
              chartType: chartParams.chartType,
            })}
            data={dataApi.result}
          />
        </ApiStatusWrapper>
      )}
    </div>
  );
};

export default ReportCard;
