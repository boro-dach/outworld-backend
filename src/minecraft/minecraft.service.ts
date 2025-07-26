import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface MinecraftItem {
  type: string;
  amount: number;
}
export interface CommandResponse {
  output: string[];
  success: boolean;
}

@Injectable()
export class MinecraftService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly httpConfig: { headers: { Authorization: string } };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get('MINECRAFT_API_URL');
    this.apiKey = this.configService.get('MINECRAFT_API_KEY');
    this.httpConfig = { headers: { Authorization: this.apiKey } };
  }

  async getPlayerInventory(playerName: string): Promise<MinecraftItem[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Record<string, MinecraftItem>>(
          `${this.apiUrl}/players/${playerName}/inventory`,
          this.httpConfig,
        ),
      );
      const responseData = response.data;
      if (typeof responseData !== 'object' || responseData === null) {
        throw new InternalServerErrorException(
          'API инвентаря вернуло не-объектные данные.',
        );
      }
      return Object.values(responseData);
    } catch (error) {
      if (error.response?.status === 404)
        throw new NotFoundException(
          `Игрок (банкир) с ником '${playerName}' не найден или оффлайн.`,
        );
      console.error(
        'Error during getPlayerInventory:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Не удалось связаться с сервером Minecraft для получения инвентаря.',
      );
    }
  }

  async executeCommand(command: string): Promise<CommandResponse> {
    const commandToSend = command.startsWith('/')
      ? command.substring(1)
      : command;
    const encodedCommand = encodeURIComponent(commandToSend);
    const url = `${this.apiUrl}/server/exec?command=${encodedCommand}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<CommandResponse>(url, {}, this.httpConfig),
      );
      return response.data;
    } catch (error) {
      console.error(`Error executing command via POST to URL: ${url}`);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(
        `Ошибка выполнения команды на сервере Minecraft: ${errorMessage}`,
      );
    }
  }
}
