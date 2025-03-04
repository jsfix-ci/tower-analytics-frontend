// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Main from '@redhat-cloud-services/frontend-components/Main';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import {
  Button,
  ButtonVariant,
  Card,
  CardActions,
  CardFooter,
  CardHeader,
  CardTitle,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Gallery,
  Label,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import {
  AngleLeftIcon,
  AngleRightIcon,
  CaretDownIcon,
} from '@patternfly/react-icons';

import paths from '../paths';
import ListItem from './ListItem';
import { TagName, TAGS } from '../Shared/constants';
import getComponent from '../Layouts/index';
import useRequest from '../../../Utilities/useRequest';
import { readReport, readReports, reportOptions } from '../../../Api';
import { ReportSchema } from '../Layouts/types';
import { reportDefaultParams } from '../../../Utilities/constants';
import { useQueryParams } from '../../../QueryParams';
import FilterableToolbar from '../../../Components/Toolbar/Toolbar';
import EmptyList from '../../../Components/EmptyList';

export interface Report {
  slug: string;
  name: string;
  description: string;
  tags: any[];
  tableHeaders: string[];
}

export const removeFilters = (): string => {
  const currentURL = window.location.href;
  const newURL = '';
  if (currentURL.includes('default.attributes[]')) {
    newURL = currentURL.substring(
      currentURL.indexOf('?') + 1,
      currentURL.indexOf('default.attributes[]') - 1
    );
  } else if (
    currentURL.includes('?') &&
    currentURL.includes('default.attributes[]') === false
  ) {
    newURL = currentURL.substring(currentURL.indexOf('?') + 1);
  }

  return newURL;
};

const List: FunctionComponent<Record<string, never>> = () => {
  const [selected, setSelected] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();
  let index = 0;
  let nextItem = '';
  let previousItem = '';
  const queryParams = useQueryParams(
    reportDefaultParams('reports'),
    'allReports'
  ).queryParams;
  const setFromToolbar = useQueryParams(
    reportDefaultParams('reports'),
    'allReports'
  ).setFromToolbar;

  const {
    result: { reports: data },
    isSuccess: isSuccess,
    request: fetchReports,
  } = useRequest(readReports, { reports: [] });

  const optionsQueryParams = useQueryParams(reportDefaultParams('reports'));
  const { result: options, request: fetchOptions } = useRequest(
    reportOptions,
    {}
  );

  useEffect(() => {
    fetchReports(queryParams);
    fetchOptions(optionsQueryParams.queryParams);
  }, [queryParams]);

  const reports = data as Report[];

  const {
    result: previewReport,
    request: fetchReport,
    isSuccess: isReportSuccess,
  } = useRequest(async () => {
    const response = await readReport(selected || reports[0].slug);
    return response.report as ReportSchema;
  }, {} as ReportSchema);

  useEffect(() => {
    if (isSuccess && reports.length > 0) {
      const report = reports.filter(({ slug }) => selected === slug);
      if (selected === '' || report.length === 0) setSelected(reports[0].slug);
      fetchReport();
    }
  }, [reports, selected]);

  const dropdownItems = [
    isSuccess &&
      reports.length > 0 &&
      isReportSuccess &&
      reports.map((report) => {
        return (
          <Button
            key={report.slug}
            variant={ButtonVariant.plain}
            aria-label="Report list item"
            onClick={() => setSelected(report.slug)}
          >
            <DropdownItem key={report.slug}>{report.name}</DropdownItem>
          </Button>
        );
      }),
  ];

  return (
    <>
      <PageHeader data-cy={'header-all_reports'}>
        <PageHeaderTitle title={'Reports'} />
        <FilterableToolbar
          categories={options}
          filters={queryParams}
          setFilters={setFromToolbar}
        />
      </PageHeader>
      {isSuccess && reports.length > 0 && isReportSuccess && (
        <Main>
          {reports
            .filter((report: Report) => report.slug === selected)
            .map((report) => {
              return (
                (index = reports.indexOf(report)),
                reports.indexOf(report) < reports.length - 1 &&
                  (nextItem = reports[index + 1].slug),
                reports.indexOf(report) > 0 &&
                  (previousItem = reports[index - 1].slug),
                (
                  <>
                    <Card
                      key={report.slug}
                      style={{
                        maxWidth: '100%',
                        marginBottom: '25px',
                      }}
                      isCompact
                      data-cy={report.slug}
                    >
                      <CardHeader
                        style={{
                          paddingTop: '16px',
                          paddingBottom: '16px',
                          paddingRight: '0px',
                        }}
                      >
                        <CardTitle>
                          <Link
                            data-cy={'preview_title_link'}
                            to={paths.getDetails(report.slug)}
                          >
                            {report.name}
                          </Link>
                        </CardTitle>
                        <CardActions
                          style={{ marginLeft: '15px', marginTop: '-2px' }}
                        >
                          {report.tags.map(
                            (
                              tagKey: TagName,
                              idx: React.Key | null | undefined
                            ) => {
                              const tag = TAGS.find((t) => t.key === tagKey);
                              if (tag) {
                                return (
                                  <Tooltip
                                    key={`tooltip_${idx as string}`}
                                    position={TooltipPosition.top}
                                    content={tag.description}
                                  >
                                    <Label key={idx}>{tag.name}</Label>
                                  </Tooltip>
                                );
                              }
                            }
                          )}
                        </CardActions>
                        <CardActions>
                          <Button
                            variant={ButtonVariant.plain}
                            aria-label="Previous report"
                            data-cy={'previous_report_button'}
                            isDisabled={reports.indexOf(report) === 0}
                            onClick={() => {
                              history.replace({
                                search: removeFilters(),
                              });
                              setSelected(previousItem);
                            }}
                          >
                            <AngleLeftIcon />
                          </Button>
                          <Dropdown
                            data-cy={'preview_dropdown'}
                            isPlain
                            onSelect={() => {
                              setIsOpen(!isOpen);
                              history.replace({
                                search: removeFilters(),
                              });
                            }}
                            toggle={
                              <DropdownToggle
                                onToggle={(next) => setIsOpen(next)}
                                toggleIndicator={CaretDownIcon}
                                id="report_list"
                                data-cy={'selected_report_dropdown'}
                                style={{ color: '#151515' }}
                              >
                                {report.name}
                              </DropdownToggle>
                            }
                            isOpen={isOpen}
                            dropdownItems={dropdownItems}
                          />
                          <Button
                            variant={ButtonVariant.plain}
                            aria-label="Next report"
                            data-cy="next_report_button"
                            isDisabled={
                              reports.indexOf(report) >= reports.length - 1
                            }
                            onClick={() => {
                              history.replace({
                                search: removeFilters(),
                              });
                              setSelected(nextItem);
                            }}
                          >
                            <AngleRightIcon />
                          </Button>
                        </CardActions>
                      </CardHeader>
                      <Divider />
                      {getComponent(previewReport, false)}
                      <CardFooter style={{ paddingBottom: '16px' }}>
                        <Link
                          to={paths.getDetails(report.slug)}
                          style={{ float: 'right' }}
                          data-cy={'view_full_report_link'}
                        >
                          View full report
                        </Link>
                      </CardFooter>
                    </Card>
                  </>
                )
              );
            })}
          <Gallery
            data-cy="all_reports"
            hasGutter
            minWidths={{
              sm: '307px',
              md: '307px',
              lg: '307px',
              xl: '307px',
              '2xl': '307px',
            }}
          >
            {reports.map((report) => (
              <ListItem
                key={report.slug}
                report={report}
                selected={selected}
                setSelected={setSelected}
                history={history}
              />
            ))}
          </Gallery>
        </Main>
      )}
      {isSuccess && reports.length === 0 && (
        <EmptyList
          label={'Clear all filters'}
          title={'No results found'}
          message={
            'No results match the filter criteria. Clear all filters and try again.'
          }
          showButton={true}
          path={'/reports'}
        />
      )}
    </>
  );
};

export default List;
