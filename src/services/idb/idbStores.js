export const IDB_NAME = 'my-admin-local'
export const IDB_VERSION = 9

export const IDB_STORES = {
  // CashFlow module
  CF_SALARY_DISTRIBUTION: 'cashflow_salary_distribution',
  CF_MY_PROJECTS: 'cashflow_my_projects',
  CF_ASSETS: 'cashflow_assets',
  CF_ACCOUNTS_MASTER: 'cashflow_accounts_master',

  // Taxi module
  TAXI_VEHICLES: 'taxi_vehicles',

  // Finance module
  FINANCE_GRID_TRADES: 'finance_grid_trades',
  FINANCE_CALC_LIST: 'finance_calc_list',

  // Misc
  MISC_TASKS: 'misc_tasks',

  // App-level
  APP_METADATA: 'app_metadata',
}
