import { HttpContextToken } from '@angular/common/http';

export const CUSTOM_BRANCH_ID = new HttpContextToken<string | null>(() => null);
