import { NotificationOptions } from '../globalTypes';
import { DispatchType } from '../store';

export type Params = Record<
  string,
  string | number | string[] | number[] | boolean | undefined
>;

export type OptionsReturnType = Record<
  string,
  { key: string; value: string }[]
>;
export type ApiJson = Record<string, unknown> | OptionsReturnType;

export interface ParamsWithPagination {
  limit?: string | number;
  offset?: string | number;
  sort_options?: string;
  sort_order?: 'asc' | 'desc';
  [x: string]: string | number | string[] | number[] | boolean | undefined;
}

export interface PDFParams {
  slug: string;
  schemaParams: Record<string, string>;
  dataFetchingParams: {
    endpointUrl: string;
    queryParams: Params;
    selectOptions: OptionsReturnType;
    showExtraRows: boolean;
    chartSeriesHiddenProps: boolean[];
  };
}

export interface saveROIParams {
  currency: string;
  hourly_manual_labor_cost: number;
  hourly_automation_cost: number;
  templates_manual_equivalent: {
    template_id: number;
    effort_minutes: number;
    template_weigh_in: boolean;
  }[];
}

export type NotificationAsyncFunction = (
  id: string,
  message?: string
) => NotificationOptions;

export interface NotificationParams {
  pending: NotificationAsyncFunction;
  rejected: NotificationAsyncFunction;
  dispatch: DispatchType;
  id: string;
}

export type ReadParams = { params: Params };
export type ReadParamsWithPagination = { params: ParamsWithPagination };

export type ReadEndpointFnc = (
  params: Params | ParamsWithPagination
) => Promise<ApiJson>;
