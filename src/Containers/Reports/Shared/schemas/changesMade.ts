import {
  ChartSchemaElement,
  ChartKind,
  ChartLegendOrientation,
  ChartLegendPosition,
  ChartTopLevelType,
  ChartType,
  ChartThemeColor,
} from 'react-json-chart-builder';
import { readJobExplorer, readJobExplorerOptions } from '../../../../Api';
import { CATEGORIES } from '../constants';
import { AttributesType, ReportPageParams } from '../types';

const slug = 'changes_made_by_job_template';

const name = 'Changes made by job template';

const description =
  'The total count of changes made by each job template in a specified time window.\n\nYou can use this report to ensure the correct number of changes are made per hostname, as well as see which job templates are doing the most changes to your infrastructure.';

const categories = [CATEGORIES.executive];

const defaultTableHeaders: AttributesType = [
  { key: 'id', value: 'ID' },
  { key: 'name', value: 'Template name' },
];

const tableAttributes = [
  'host_count',
  'changed_host_count',
  'host_task_count',
  'host_task_changed_count',
];

const expandedAttributes = [] as string[];

const defaultParams = {
  limit: 6,
  offset: 0,
  attributes: [...tableAttributes, ...expandedAttributes],
  group_by: 'template',
  group_by_time: true,
  granularity: 'monthly',
  quick_date_range: 'last_6_months',
  sort_options: 'changed_host_count',
  sort_order: 'desc',
  cluster_id: [],
  inventory_id: [],
  job_type: [],
  org_id: [],
  status: [],
  template_id: [],
};

const availableChartTypes = [ChartType.line, ChartType.bar];

const schemaFnc = (
  label: string,
  y: string,
  xTickFormat: string,
  chartType: ChartType
): ChartSchemaElement[] => [
  {
    id: 1,
    kind: ChartKind.wrapper,
    type: ChartTopLevelType.chart,
    parent: null,
    props: {
      height: 400,
      padding: {
        top: 40,
        bottom: 85,
        right: 90,
        left: 90,
      },
      domainPadding: {
        y: 25,
        x: chartType == ChartType.bar ? 85 : 0,
      },
      themeColor: ChartThemeColor.multiOrdered,
    },
    xAxis: {
      label: 'Date',
      tickFormat: xTickFormat,
      style: {
        axisLabel: {
          padding: 50,
        },
      },
    },
    yAxis: {
      tickFormat: 'formatNumberAsK',
      showGrid: true,
      label,
      style: {
        axisLabel: {
          padding: 60,
        },
      },
    },
    api: {
      url: '',
      params: {},
    },
    legend: {
      interactive: true,
      orientation: ChartLegendOrientation.vertical,
      position: ChartLegendPosition.right,
    },
    tooltip: {
      mouseFollow: true,
      stickToAxis: 'x',
      cursor: true,
      legendTooltip: {
        titleProperyForLegend: 'created_date',
      },
    },
  },
  {
    id: 2,
    kind: ChartKind.group,
    parent: 1,
    template: {
      id: 0,
      kind: ChartKind.simple,
      type: chartType,
      parent: 0,
      props: {
        x: 'created_date',
        y,
      },
      tooltip: {
        labelName: '',
      },
    },
  },
];

const reportParams: ReportPageParams = {
  slug,
  name,
  description,
  categories,
  report: {
    slug,
    defaultParams,
    defaultTableHeaders,
    tableAttributes,
    expandedAttributes,
    availableChartTypes,
    readData: readJobExplorer,
    readOptions: readJobExplorerOptions,
    schemaFnc,
  },
};

export default reportParams;
