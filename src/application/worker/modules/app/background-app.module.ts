import {Module} from '@nestjs/common';
import {AuthWorkerModule} from '../auth/auth-worker.module';

@Module({
  imports: [AuthWorkerModule],
})
export class BackgroundAppModule {}
