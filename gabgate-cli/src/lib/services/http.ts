import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { SessionService } from './session';
import { UtilityService } from './utility';

/**
 * Service for making HTTP requests
 */
export class HttpService {
	private axiosInstance: AxiosInstance;
	private _reqConfig: AxiosRequestConfig;

	public constructor(baseURL: string) {
		this.axiosInstance = axios.create({
			baseURL,
			responseType: 'json',
			headers: {
				client: 'gabgate-cli'
			}
		});

		this.axiosInstance.interceptors.response.use(this.responseSuccessInterceptor, this.responseErrorInterceptor);
	}

	/**
	 * Return Axios request config
	 *
	 * @returns Axios request config
	 */
	public get reqConfig(): AxiosRequestConfig {
		return this._reqConfig;
	}

	/**
	 * Set Axios request config
	 *
	 * @param reqConfig Axios request config
	 */
	public set reqConfig(reqConfig: AxiosRequestConfig) {
		this._reqConfig = reqConfig;
	}

	/**
	 * Send custom request
	 *
	 * @param reqConfig Axios request config
	 * @returns HTTP request response
	 */
	public request(reqConfig: AxiosRequestConfig): Promise<any> {
		return new Promise((resolve, reject) => {
			this.axiosInstance
				.request(reqConfig)
				.then(res => {
					resolve(res);
				})
				.catch(err => {
					reject(err);
				});
		});
	}

	/**
	 * Fetch data from resource
	 *
	 * @param path URL path to fetch data from
	 * @param params URL params
	 * @returns HTTP request reponse
	 */
	public fetchData(path: string, params?: object): Promise<any> {
		let headers: any = {};

		if (SessionService.user) {
			headers = {
				Authorization: `Bearer ${SessionService.user.token}`
			};
		}

		return new Promise((resolve, reject) => {
			this.axiosInstance
				.get(path, { ...this._reqConfig, params, headers })
				.then(res => {
					resolve(res);
				})
				.catch(err => {
					reject(err);
				});
		});
	}

	/**
	 * Post data to resource
	 *
	 * @param path URL path to post data to
	 * @param data Body data
	 * @returns HTTP request resposne
	 */
	public postData(path: string, data: object = {}): Promise<any> {
		let headers: any = {};

		if (SessionService.user) {
			headers = {
				Authorization: `Bearer ${SessionService.user.token}`
			};
		}

		return new Promise((resolve, reject) => {
			this.axiosInstance
				.post(path, data, { ...this._reqConfig, headers })
				.then(res => {
					resolve(res);
				})
				.catch(err => {
					reject(err);
				});
		});
	}

	/**
	 * Delete data from resource
	 *
	 * @param path URL path to delete data from
	 * @param params URL params
	 * @returns HTTP request reponse
	 */
	public deleteData(path: string): Promise<any> {
		let headers: any = {};

		if (SessionService.user) {
			headers = {
				Authorization: `Bearer ${SessionService.user.token}`
			};
		}

		return new Promise((resolve, reject) => {
			this.axiosInstance
				.delete(path, { ...this._reqConfig, headers })
				.then(res => {
					resolve(res);
				})
				.catch(err => {
					reject(err);
				});
		});
	}

	/**
	 * Interceptor for successful axios responses
	 *
	 * @param res Axios response to intercept
	 * @returns Intercepted Axios response
	 */
	private responseSuccessInterceptor(res: AxiosResponse): AxiosResponse<any> {
		return res.data.data;
	}

	/**
	 * Interceptor for axios response errors
	 *
	 * @param res Axios error to intercept
	 * @returns Intercepted Axios error
	 */
	private responseErrorInterceptor(err: AxiosError): any {
		const error: Error = UtilityService.processError(
			err,
			err.response && err.response.data ? err.response.data.status : undefined
		);

		return Promise.reject(error);
	}
}
