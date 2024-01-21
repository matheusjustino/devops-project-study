import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express/adapters';
import helmet from 'helmet';
import compression from 'compression';
import { json } from 'express';

import { AppModule } from './app.module';
import { configureAndBuildSwagger } from './modules/app-config/swagger';

async function bootstrap() {
	const PORT = process.env.PORT || 8081;
	const app = await NestFactory.create<NestExpressApplication>(
		AppModule,
		new ExpressAdapter(),
	);

	app.use(helmet());
	app.use(compression());
	app.use(json({ limit: '30mb' }));
	app.setGlobalPrefix('api');

	app.enableShutdownHooks();

	configureAndBuildSwagger(app);

	await app.listen(PORT, () =>
		Logger.log(`APP is running on port: ${PORT}`, 'BOOTSTRAP'),
	);
}
bootstrap();
