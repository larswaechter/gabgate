import { existsSync, mkdirSync, readFileSync, statSync, writeFile } from 'fs';
import { homedir } from 'os';
import { basename, extname, resolve as resolvePath } from 'path';

/**
 * File interface used for client and ws communication
 */
export interface IFile {
	_buffer: Buffer;
	_name: string;
	_size: number;
	_type: string;
}

export class File {
	/**
	 * Folder to store files in
	 */
	public static storageFolder: string = 'gabgate';

	/**
	 * Path to store files in
	 */
	public static storagePath: string = resolvePath(homedir(), File.storageFolder);

	/**
	 * Max allowed file size to send (10MB)
	 */
	public static allowedFileSize: number = 10000000;

	/**
	 * Allowed file types to send
	 */
	public static allowedFileTypes: string[] = ['.jpg', '.jpeg', '.png', '.mp3', '.wav'];

	/**
	 * Create new File instance from file path
	 *
	 * @param filepath Path to read file from
	 * @returns New File instance
	 */
	public static createFromPath(filepath: string) {
		const path: string = resolvePath(filepath);
		const buffer: Buffer = readFileSync(path);
		const name: string = basename(path, extname(path));
		const size: number = statSync(path).size;
		const type: string = extname(path);

		return new File(buffer, name, size, type, path);
	}

	private _path: string;
	private _buffer: Buffer;
	private _name: string;
	private _size: number;
	private _type: string;

	/**
	 * Create new File instance
	 *
	 * @param buffer File buffer
	 * @param name File name
	 * @param size File size
	 * @param type File type
	 * @param path File path
	 * @returns New file instance
	 */
	constructor(buffer: Buffer, name: string, size: number, type: string, path?: string) {
		this._buffer = buffer;
		this._name = name;
		this._size = size;
		this._type = type;
		this._path = path || resolvePath(File.storagePath) + '/' + name + type;
	}

	public get path(): string {
		return this._path;
	}

	public set path(path: string) {
		this._path = path;
	}

	public get buffer(): Buffer {
		return this._buffer;
	}

	public set buffer(buffer: Buffer) {
		this._buffer = buffer;
	}

	public get name(): string {
		return this._name;
	}

	public set name(name: string) {
		this._name = name;
	}

	public get size(): number {
		return this._size;
	}

	public set size(size: number) {
		this._size = size;
	}

	public get type(): string {
		return this._type;
	}

	public set type(type: string) {
		this._type = type;
	}

	public hasValidSize(): boolean {
		return this._size > 0 && this._size <= File.allowedFileSize;
	}

	public hasValidType(): boolean {
		return File.allowedFileTypes.includes(this._type);
	}

	public isValid(): boolean {
		return this.hasValidSize() && this.hasValidType();
	}

	public save() {
		return new Promise((resolve, reject) => {
			// Create the store directory if it does not exist
			if (!existsSync(File.storagePath)) {
				mkdirSync(File.storagePath);
			}

			// Store file
			writeFile(this._path, this._buffer, err => {
				if (err) {
					reject(err);
				}
				resolve();
			});
		});
	}
}
