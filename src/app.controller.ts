import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';

@ApiTags('[APP')
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	public checkServer(): string {
		return this.appService.checkServer();
	}
}
