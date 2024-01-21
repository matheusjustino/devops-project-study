import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	public checkServer(): string {
		return 'Server is running!';
	}
}
