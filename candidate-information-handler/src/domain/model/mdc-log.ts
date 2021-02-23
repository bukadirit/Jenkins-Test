export class MdcLogObject {
	private readonly app: string = 'apmod';
	private readonly domain: string = 'cand_info';
	private readonly functionName: string = 'api';
	public messageId: string = '';
	public version: string = '';
	public candId: string = '';
	public invkId: string = '';
	public invkdby: string = '';
    public rqstid: string = '';


	public getMDC(): string {
		return ` app=${this.app},domain=${this.domain},function=${this.functionName},version=${this.version},messageId=${this.messageId},rqstid=${this.rqstid} `;
	}

	public getClassMDC(cls: string, msg: string): string {
		return `app=${this.app},domain=${this.domain},cls=${cls},invkId=${this.invkId},invkdby=${this.invkdby},rqstid=${this.rqstid},candId=${this.candId},msg=${msg} `;
	}

	public getClassMDCErrorWithAttrs(cls: string, attrs: string, msg: Error): string {
		return `app=${this.app},domain=${this.domain},cls=${cls},invkId=${this.invkId},invkdby=${this.invkdby},rqstid=${this.rqstid},candId=${this.candId},${attrs},msg=${msg} `;
	}
}
export const mdcLog: MdcLogObject = new MdcLogObject();
