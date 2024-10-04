import { ETestStatus } from "../enums/ETestStatus";

export interface ITestCase {
    itemName: string;
    status?: ETestStatus;
    args?: string | undefined;
}
