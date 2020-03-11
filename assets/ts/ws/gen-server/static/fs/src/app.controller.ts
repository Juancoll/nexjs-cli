import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { env, PackageJson } from './services/env';

@Controller()
export class AppController {

    @Get()
    get(): PackageJson {
        try {
            return env.package;
        } catch (err) {
            if (err.getStatus) {
                throw err;
            }
            throw new HttpException(err.message, HttpStatus.NOT_ACCEPTABLE);
        }
    }

    @Get('version')
    getVersion(): string | undefined {
        try {
            return env.package.version;
        } catch (err) {
            if (err.getStatus) {
                throw err;
            }
            throw new HttpException(err.message, HttpStatus.NOT_ACCEPTABLE);
        }
    }
}
