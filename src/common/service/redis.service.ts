import { createClient, RedisClientType } from "redis";
import { REDIS_URL } from "../../config/config.service.js";

export class RedisService {
  private readonly redis_client: RedisClientType;

  constructor() {
    this.redis_client = createClient({
      url: REDIS_URL!,
    });
    this.handleEvent();
    this.connect();
  }
  handleEvent() {
    this.redis_client.on("error", (error) => {
      console.log("Redis connection failed:🤷‍♂️", error.message);
    });
  }
  async connect() {
    try {
      await this.redis_client.connect();
      console.log("Redis connected successfully❤️");
    } catch (error) {
      console.log("Redis connect() failed:🤷‍♂️", error);
    }
  }

  async max_otp_key(email: string) {
    return `otp::${email}::max`;
  }
  async block_otp_key(email: string) {
    return `block_otp_key:${email}::block`;
  }

  async setValue({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: any;
    ttl?: number | undefined;
  }) {
    try {
      value = typeof value == "string" ? value : JSON.stringify(value);
      return ttl
        ? await this.redis_client.set(key, value, { EX: ttl })
        : await this.redis_client.set(key, value);
    } catch (error) {
      console.log(error, `\nRedis setValue Failed`);
    }
  }

  async updateValue({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: any;
    ttl?: number;
  }) {
    try {
      if (!(await this.redis_client.exists(key))) {
        throw new Error(`Key:${key} not found in Redis`);
      }
      return await this.setValue({ key, value, ttl });
    } catch (error) {
      console.log(error, `\nRedis updateValue Failed`);
    }
  }

  async getValue(key: string) {
    try {
      const raw = await this.redis_client.get(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    } catch (error) {
      console.log(error, `\nRedis getValue Failed`);
    }
  }

  async ttl(key: string) {
    try {
      return await this.redis_client.ttl(key);
    } catch (error) {
      console.log(error, `\nRedis ttl Failed`);
    }
  }

  async exists(key: string) {
    try {
      return await this.redis_client.exists(key);
    } catch (error) {
      console.log(error, `\nRedis ttl Failed`);
    }
  }

  async expire({ key, ttl }: { key: string; ttl: number }) {
    try {
      return await this.redis_client.expire(key, ttl);
    } catch (error) {
      console.log(error, `\nRedis expire Failed`);
    }
  }

  async deleteKey(key: string) {
    try {
      if (!key?.length) throw new Error(`Key:${key} not found in Redis`);
      return await this.redis_client.del(key);
    } catch (error) {
      console.log(error, `\nRedis delete Failed`);
    }
  }

  async keys(pattern: string) {
    try {
      return await this.redis_client.keys(`${pattern}*`);
    } catch (error) {
      console.log(error, `\nRedis key Failed`);
    }
  }

  async incr(value: string) {
    try {
      return await this.redis_client.incr(value);
    } catch (error) {
      console.log(error, `\nRedis incr Failed`);
    }
  }
}

export default new RedisService();
