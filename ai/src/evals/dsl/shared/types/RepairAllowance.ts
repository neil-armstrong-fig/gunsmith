/** How many times the model may be asked to repair its own answer within one request. Zero means the first answer had to do. */
export interface RepairAllowance {
  maximumRepairs: number;
}
