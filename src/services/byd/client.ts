import { Platform } from 'react-native';
import { BangcleCodec, md5Hex, pwdLoginKey, sha1Mixed, buildSignString, computeCheckcode, aesEncryptHex, aesDecryptUtf8 } from './crypto';

export interface BydDeviceProfile {
  ostype: string;
  imei: string;
  mac: string;
  model: string;
  sdk: string;
  mod: string;
  imei_md5: string;
  mobile_brand: string;
  mobile_model: string;
  device_type: string;
  network_type: string;
  os_type: string;
  os_version: string;
}

export interface BydConfig {
  base_url: string;
  username: string;
  password: string;
  country_code: string;
  language: string;
  time_zone: string;
  app_version: string;
  app_inner_version: string;
  soft_type: string;
  is_auto: string;
  device: BydDeviceProfile;
}

export interface BydRawVehicle {
  vin: string;
  autoAlias?: string;
  modelName?: string;
  outModelType?: string;
  autoPlate?: string;
  energyType?: string;
  totalMileage?: number;
  cfPic?: {
    picMainUrl?: string;
    picSetUrl?: string;
  };
  defaultCar?: number;
  vehicleState?: string;
  tboxVersion?: string;
  [key: string]: any;
}

export interface BydVehicleCharging {
  soc?: number;
  chargingState?: number;
  connectState?: number;
  fullHour?: number;
  fullMinute?: number;
  [key: string]: any;
}

export interface BydRealtimeData {
  elecPercent?: number | string;
  onlineState?: number;
  pwr?: number;
  powerGear?: number;
  time?: number | string;
  leftFrontTirepressure?: string | number;
  rightFrontTirepressure?: string | number;
  leftRearTirepressure?: string | number;
  rightRearTirepressure?: string | number;
  leftFrontDoor?: number;
  rightFrontDoor?: number;
  leftRearDoor?: number;
  rightRearDoor?: number;
  trunkLid?: number;
  forehold?: number;
  leftFrontWindow?: number;
  rightFrontWindow?: number;
  leftRearWindow?: number;
  rightRearWindow?: number;
  tempInCar?: number | string;
  totalMileage?: number | string;
  requestSerial?: string;
  [key: string]: any;
}

export interface BydVehicle {
  vin: string;
  carName?: string;
  modelName?: string;
  carPlate?: string;
  powerType?: string; // 0: EV, 1: ICE, 2: Hybrid
  batteryCapacity?: string;
  status?: string;
  soc?: number;
  onlineState?: number;
  tempInCar?: number;
  totalMileage?: number;
  tirePressures?: {
    leftFront?: number;
    rightFront?: number;
    leftRear?: number;
    rightRear?: number;
  };
  picUrl?: string;
  raw?: BydRawVehicle;
  realtime?: BydRealtimeData;
}

export class BydSessionExpiredError extends Error {
  public code: string;
  constructor(code: string = 'SESSION_EXPIRED', message: string = 'La session a expiré ou le jeton de connexion est invalide.') {
    super(message);
    this.name = 'BydSessionExpiredError';
    this.code = code;
  }
}

export class Session {
  constructor(
    public user_id: string,
    public sign_token: string,
    public encry_token: string
  ) {}

  public contentKey(): string {
    return md5Hex(this.encry_token);
  }

  public signKey(): string {
    return md5Hex(this.sign_token);
  }
}

export class ExpoBydClient {
  public config: BydConfig;
  private codec: BangcleCodec;
  public session: Session | null = null;

  constructor(config: { username: string; password: string; country_code?: string; language?: string; base_url?: string }) {
    const derivedImeiMd5 = md5Hex(config.username || 'byd_user');

    const defaultDevice: BydDeviceProfile = {
      ostype: 'and',
      imei: 'BANGCLE01234',
      mac: '00:00:00:00:00:00',
      model: 'POCO F1',
      sdk: '35',
      mod: 'Xiaomi',
      imei_md5: derivedImeiMd5,
      mobile_brand: 'XIAOMI',
      mobile_model: 'POCO F1',
      device_type: '0',
      network_type: 'wifi',
      os_type: '15',
      os_version: '35',
    };

    const isWeb = Platform.OS === 'web';
    const defaultBaseUrl = isWeb ? '/byd-api' : 'https://dilinkappoversea-eu.byd.auto';

    this.config = {
      base_url: config.base_url || defaultBaseUrl,
      username: config.username,
      password: config.password,
      country_code: config.country_code || 'FR',
      language: config.language || 'fr',
      time_zone: 'Europe/Paris',
      app_version: '3.2.2',
      app_inner_version: '322',
      soft_type: '0',
      is_auto: '1',
      device: defaultDevice,
    };

    this.codec = new BangcleCodec();
  }

  public setSession(userId: string, signToken: string, encryToken: string) {
    this.session = new Session(userId, signToken, encryToken);
  }

  public async login(): Promise<Session> {
    await this.codec.init();
    const nowMs = Date.now();
    const randomHex = md5Hex(String(Math.random()) + String(nowMs)).toUpperCase();
    const serviceTime = String(nowMs);

    const inner = {
      agreeStatus: '0',
      agreementType: '[1,2]',
      appInnerVersion: this.config.app_inner_version,
      appVersion: this.config.app_version,
      deviceName: `${this.config.device.mobile_brand}${this.config.device.mobile_model}`,
      deviceType: this.config.device.device_type,
      imeiMD5: this.config.device.imei_md5,
      isAuto: this.config.is_auto,
      mobileBrand: this.config.device.mobile_brand,
      mobileModel: this.config.device.mobile_model,
      networkType: this.config.device.network_type,
      osType: this.config.device.os_type,
      osVersion: this.config.device.os_version,
      random: randomHex,
      softType: this.config.soft_type,
      timeStamp: String(nowMs),
      timeZone: this.config.time_zone,
    };

    const encryData = aesEncryptHex(
      JSON.stringify(inner),
      pwdLoginKey(this.config.password)
    );

    const passwordMd5 = md5Hex(this.config.password);
    const signFields: Record<string, string> = {
      ...inner,
      appName: 'pyBYD+0.0.72',
      countryCode: this.config.country_code,
      functionType: 'pwdLogin',
      identifier: this.config.username,
      identifierType: '0',
      language: this.config.language,
      reqTimestamp: String(nowMs),
    };

    const sign = sha1Mixed(buildSignString(signFields, passwordMd5));

    const outer: Record<string, any> = {
      appName: 'pyBYD+0.0.72',
      countryCode: this.config.country_code,
      encryData: encryData,
      functionType: 'pwdLogin',
      identifier: this.config.username,
      identifierType: '0',
      imeiMD5: this.config.device.imei_md5,
      isAuto: this.config.is_auto,
      language: this.config.language,
      reqTimestamp: String(nowMs),
      sign: sign,
      signKey: this.config.password,
      ostype: this.config.device.ostype,
      imei: this.config.device.imei,
      mac: this.config.device.mac,
      model: this.config.device.model,
      sdk: this.config.device.sdk,
      mod: this.config.device.mod,
      serviceTime: serviceTime,
    };

    outer.checkcode = computeCheckcode(outer);

    const response = await this.postSecure('/app/account/login', outer);
    const code = String(response.code);

    if (code !== '0') {
      throw new Error(`Échec de connexion BYD (code=${code}) : ${response.message || 'Identifiants invalides'}`);
    }

    const respondData = response.respondData;
    if (!respondData) {
      throw new Error('Données de réponse introuvables dans la réponse BYD.');
    }

    const plaintext = aesDecryptUtf8(respondData, pwdLoginKey(this.config.password));
    const decryptedJson = JSON.parse(plaintext);
    const token = decryptedJson.token;

    if (!token || !token.userId || !token.signToken || !token.encryToken) {
      throw new Error('Jetons de session invalides dans la réponse serveur BYD.');
    }

    this.session = new Session(
      String(token.userId),
      String(token.signToken),
      String(token.encryToken)
    );

    return this.session;
  }

  public async getVehicles(): Promise<BydVehicle[]> {
    const session = this.session;
    if (!session) throw new Error('Session non établie. Veuillez vous connecter.');

    const innerPayload = {
      deviceType: this.config.device.device_type,
      imeiMD5: this.config.device.imei_md5,
      networkType: this.config.device.network_type,
      random: md5Hex(String(Math.random()) + String(Date.now())).toUpperCase(),
      timeStamp: String(Date.now()),
      version: this.config.app_inner_version,
    };

    const res = await this.postTokenJson('/app/account/getAllListByUserId', innerPayload);
    const rawList: BydRawVehicle[] = Array.isArray(res) ? res : (res?.list || []);

    return rawList.map((raw) => ({
      vin: raw.vin,
      carName: raw.autoAlias || raw.modelName || 'BYD',
      modelName: raw.modelName || raw.outModelType || 'DiLink EV',
      carPlate: raw.autoPlate || undefined,
      powerType: raw.energyType ?? '0',
      status: raw.vehicleState === '1' ? 'En ligne' : 'Connecté',
      totalMileage: typeof raw.totalMileage === 'number' ? raw.totalMileage : Number(raw.totalMileage || 0),
      picUrl: raw.cfPic?.picMainUrl,
      raw,
    }));
  }

  /**
   * Fonction dédiée pour interroger la T-Box et récupérer la télémétrie en temps réel d'un véhicule.
   */
  public async fetchVehicleRealtime(vehicle: BydVehicle): Promise<BydVehicle> {
    const updatedVehicle: BydVehicle = { ...vehicle };

    try {
      // Interrogation T-Box temps réel (trigger + polling)
      const rt = await this.getVehicleRealtime(vehicle.vin, vehicle.raw?.tboxVersion || '3');
      updatedVehicle.realtime = rt;

      const rawElec = rt.elecPercent;
      if (rawElec !== undefined && rawElec !== null && rawElec !== '' && rawElec !== -1) {
        updatedVehicle.soc = typeof rawElec === 'number' ? rawElec : parseFloat(String(rawElec));
      }

      if (rt.onlineState === 1) {
        updatedVehicle.status = 'En ligne 🟢';
        updatedVehicle.onlineState = 1;
      } else if (rt.onlineState === 2) {
        updatedVehicle.status = 'Hors ligne 🔴';
        updatedVehicle.onlineState = 2;
      }

      const rawTemp = rt.tempInCar;
      if (rawTemp !== undefined && Number(rawTemp) > -100) {
        updatedVehicle.tempInCar = typeof rawTemp === 'number' ? rawTemp : parseFloat(String(rawTemp));
      }

      if (rt.leftFrontTirepressure) {
        updatedVehicle.tirePressures = {
          leftFront: parseFloat(String(rt.leftFrontTirepressure)),
          rightFront: parseFloat(String(rt.rightFrontTirepressure)),
          leftRear: parseFloat(String(rt.leftRearTirepressure)),
          rightRear: parseFloat(String(rt.rightRearTirepressure)),
        };
      }

      // Fallback si le SoC n'a pas été renvoyé par la T-Box
      if (updatedVehicle.soc === undefined) {
        const charging = await this.getVehicleCharging(vehicle.vin);
        if (charging && typeof charging.soc === 'number') {
          updatedVehicle.soc = charging.soc;
        }
      }
    } catch {
      // Fallback ultime vers la page de recharge
      try {
        const charging = await this.getVehicleCharging(vehicle.vin);
        if (charging && typeof charging.soc === 'number') {
          updatedVehicle.soc = charging.soc;
        }
      } catch {
        // Conserver l'état actuel si indisponible
      }
    }

    return updatedVehicle;
  }

  public async getVehicleRealtime(
    vin: string,
    tboxVersion: string = '3',
    pollAttempts: number = 5,
    pollIntervalMs: number = 1500
  ): Promise<BydRealtimeData> {
    if (!this.session) {
      throw new BydSessionExpiredError('NO_SESSION', 'Session non établie ou jeton indisponible.');
    }

    const buildInner = (extra: Record<string, any> = {}) => ({
      vin,
      deviceType: this.config.device.device_type,
      imeiMD5: this.config.device.imei_md5,
      networkType: this.config.device.network_type,
      random: md5Hex(String(Math.random()) + String(Date.now())).toUpperCase(),
      timeStamp: String(Date.now()),
      version: this.config.app_inner_version,
      energyType: '1',
      tboxVersion,
      ...extra,
    });

    const isReady = (data: any): boolean => {
      if (!data || typeof data !== 'object') return false;
      if (data.onlineState === 2) return false;
      if (data.elecPercent !== undefined && data.elecPercent !== null && data.elecPercent !== '' && data.elecPercent !== -1) return true;
      if (data.time && Number(data.time) > 0) return true;
      const tires = [data.leftFrontTirepressure, data.rightFrontTirepressure, data.leftRearTirepressure, data.rightRearTirepressure];
      if (tires.some((t) => parseFloat(String(t || '0')) > 0)) return true;
      return false;
    };

    // Phase 1 : Trigger initial
    const triggerRes = await this.postTokenJson('/vehicleInfo/vehicle/vehicleRealTimeRequest', buildInner());
    if (isReady(triggerRes)) {
      return triggerRes;
    }

    const requestSerial = triggerRes.requestSerial;
    if (!requestSerial) {
      return triggerRes;
    }

    // Phase 2 : Polling HTTP
    for (let attempt = 1; attempt <= pollAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      try {
        const pollRes = await this.postTokenJson(
          '/vehicleInfo/vehicle/vehicleRealTimeResult',
          buildInner({ requestSerial })
        );
        if (isReady(pollRes)) {
          return pollRes;
        }
      } catch {
        // En cas d'erreur lors du polling, continuer
      }
    }

    return triggerRes;
  }

  public async getVehicleCharging(vin: string): Promise<BydVehicleCharging> {
    if (!this.session) {
      throw new BydSessionExpiredError('NO_SESSION', 'Session non établie ou jeton indisponible.');
    }

    const innerPayload = {
      vin,
      deviceType: this.config.device.device_type,
      imeiMD5: this.config.device.imei_md5,
      networkType: this.config.device.network_type,
      random: md5Hex(String(Math.random()) + String(Date.now())).toUpperCase(),
      timeStamp: String(Date.now()),
      version: this.config.app_inner_version,
    };

    return this.postTokenJson('/control/smartCharge/homePage', innerPayload);
  }

  private async postTokenJson(endpoint: string, innerPayload: Record<string, any>): Promise<any> {
    if (!this.session) {
      throw new BydSessionExpiredError('NO_SESSION', 'Session non établie ou jeton indisponible.');
    }
    const session = this.session;
    const nowMs = Date.now();
    const contentKey = session.contentKey();
    const signKey = session.signKey();

    const encryData = aesEncryptHex(JSON.stringify(innerPayload), contentKey);
    const signFields = {
      ...innerPayload,
      countryCode: this.config.country_code,
      identifier: session.user_id,
      imeiMD5: this.config.device.imei_md5,
      language: this.config.language,
      reqTimestamp: String(nowMs),
    };

    const sign = sha1Mixed(buildSignString(signFields, signKey));

    const outer: Record<string, any> = {
      countryCode: this.config.country_code,
      encryData: encryData,
      identifier: session.user_id,
      imeiMD5: this.config.device.imei_md5,
      language: this.config.language,
      reqTimestamp: String(nowMs),
      sign: sign,
      ostype: this.config.device.ostype,
      imei: this.config.device.imei,
      mac: this.config.device.mac,
      model: this.config.device.model,
      sdk: this.config.device.sdk,
      mod: this.config.device.mod,
      serviceTime: String(Date.now()),
    };

    outer.checkcode = computeCheckcode(outer);
    const response = await this.postSecure(endpoint, outer);
    const code = String(response.code);

    // Détection des codes d'expiration de session BYD (1002, 1005, 1010) -> Reconnexion manuelle requise
    if (code === '1002' || code === '1005' || code === '1010') {
      this.session = null;
      throw new BydSessionExpiredError(code, `Session BYD expirée ou invalide (code ${code}). Veuillez vous reconnecter manuellement.`);
    }

    if (code !== '0') {
      throw new Error(`Erreur API BYD (${endpoint}): code ${code} - ${response.message || ''}`);
    }

    const respondData = response.respondData;
    if (!respondData) return {};
    const plaintext = aesDecryptUtf8(respondData, contentKey);
    return JSON.parse(plaintext);
  }

  private async postSecure(endpoint: string, outerPayload: Record<string, any>): Promise<any> {
    await this.codec.init();
    const compactJson = JSON.stringify(outerPayload);
    const encodedEnvelope = this.codec.encodeEnvelope(compactJson);

    const url = `${this.config.base_url}${endpoint}`;
    const headers = {
      'Accept-Encoding': 'identity',
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'okhttp/4.12.0',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ request: encodedEnvelope }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status} de l'API BYD Cloud`);
    }

    const text = await response.text();
    const bodyJson = JSON.parse(text);
    if (!bodyJson || !bodyJson.response) {
      throw new Error('Champ response manquant dans la réponse BYD');
    }

    const decodedText = this.codec.decodeResponseEnvelope(bodyJson.response);
    return JSON.parse(decodedText);
  }
}
