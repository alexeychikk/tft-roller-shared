import type { User } from '../entities/User';

import type { GenericClient } from './colyseus';

export type AuthClient = GenericClient<any, User>;
