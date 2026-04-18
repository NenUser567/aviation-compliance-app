export type Condition = {
  field: string;
  operator: string;
  value?: any;
};

export type Action = {
  type: string;
  value?: any;
};

export type Rule = {
  id: string;
  name: string;
  condition_json: Condition;
  actions_json: Action[];
};