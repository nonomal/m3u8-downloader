import { IpcMainEvent } from "electron/main";
import { inject, injectable } from "inversify";
import { handle } from "../helper/decorator";
import {
  StoreService,
  LoggerService,
  type Controller,
  VideoRepository,
  DownloadItem,
  DownloadItemPagination,
  DownloadService,
  Task,
  DownloadStatus,
} from "../interfaces";
import { TYPES } from "../types";
import { spawnDownload } from "helper";
import MainWindowServiceImpl from "services/MainWindowServiceImpl";

@injectable()
export default class DownloadController implements Controller {
  constructor(
    @inject(TYPES.LoggerService)
    private readonly logger: LoggerService,
    @inject(TYPES.StoreService)
    private readonly storeService: StoreService,
    @inject(TYPES.VideoRepository)
    private readonly videoRepository: VideoRepository,
    @inject(TYPES.DownloadService)
    private readonly downloadService: DownloadService,
    @inject(TYPES.MainWindowService)
    private readonly mainWindow: MainWindowServiceImpl
  ) {}

  @handle("add-download-item")
  async addDownloadItem(e: IpcMainEvent, video: DownloadItem) {
    const item = await this.videoRepository.addVideo(video);
    // 这里向页面发送消息，通知页面更新
    this.mainWindow.webContents.send("download-item-notifier", item);
    return item;
  }

  @handle("edit-download-item")
  async editDownloadItem(e: IpcMainEvent, video: DownloadItem) {
    const item = await this.videoRepository.editVideo(video);
    return item;
  }

  @handle("download-now")
  async downloadNow(e: IpcMainEvent, video: DownloadItem) {
    // 添加下载项
    const item = await this.addDownloadItem(e, video);
    // 开始下载
    await this.startDownload(e, item.id);
    return item;
  }

  @handle("get-download-items")
  async getDownloadItems(e: IpcMainEvent, pagination: DownloadItemPagination) {
    return await this.videoRepository.findVideos(pagination);
  }

  @handle("start-download")
  async startDownload(e: IpcMainEvent, vid: number) {
    // 查找将要下载的视频
    const video = await this.videoRepository.findVideo(vid);
    if (!video) {
      return Promise.reject("没有找到该视频");
    }
    const { name, url } = video;
    const local = this.storeService.get("local");

    // 从配置中添加参数
    const deleteSegments = this.storeService.get("deleteSegments");

    const task: Task = {
      id: vid,
      params: {
        url,
        local,
        name,
        deleteSegments,
      },
      process: spawnDownload,
    };
    await this.videoRepository.changeVideoStatus(vid, DownloadStatus.Watting);
    this.downloadService.addTask(task);
  }

  @handle("stop-download")
  async stopDownload(e: IpcMainEvent, id: number) {
    this.downloadService.stopTask(id);
  }

  @handle("delete-download-item")
  async deleteDownloadItem(e: IpcMainEvent, id: number) {
    return await this.videoRepository.deleteDownloadItem(id);
  }
}
