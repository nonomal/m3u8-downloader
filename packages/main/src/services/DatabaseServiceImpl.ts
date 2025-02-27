import { db } from "../helper/variables";
import { inject, injectable } from "inversify";
import { DataSource, EntityManager } from "typeorm";
import { TYPES } from "../types";
import { DatabaseService, LoggerService } from "../interfaces";
import { Video } from "../entity/Video";
import { Favorite } from "entity/Favorite";

@injectable()
export default class DatabaseServiceImpl implements DatabaseService {
  appDataSource: DataSource;

  constructor(
    @inject(TYPES.LoggerService)
    private readonly logger: LoggerService
  ) {
    logger.info("数据库地址是： ", db);
    this.appDataSource = new DataSource({
      type: "better-sqlite3",
      database: db,
      synchronize: true,
      logging: false,
      entities: [Video, Favorite],
      migrations: [],
      subscribers: [],
    });
  }

  async init(): Promise<void> {
    await this.appDataSource.initialize();
  }

  get manager(): EntityManager {
    return this.appDataSource.manager;
  }
}
