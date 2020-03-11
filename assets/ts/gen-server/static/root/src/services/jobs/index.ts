import { Logger } from '@nestjs/common';

import { JobManager } from './JobManager';

export const jobs: JobManager = new JobManager();
