import chai from 'chai';
import chaiPromised from 'chai-as-promised';
import sinon from 'sinon';
import { mdcLog } from '../src/domain/model/mdc-log';



describe('ci-mdclog-model-test-suite', function () {


	const mdcLogObject:String = mdcLog.getMDC();
	const clMDC:String  = mdcLog.getClassMDC('CandidateInformationHandlerApplicationService', `processEvent-START`);
	const clMDCErrWithAtt:String  = mdcLog.getClassMDCErrorWithAttrs(
		'getCandidateInformationHandlerFunction',
		'res=error',
		new Error('Invalid request parameters')
	)
	

	let sandbox = sinon.createSandbox();
	mdcLog.version = '1';

	chai.use(chaiPromised);
	let expect = chai.expect;

	this.afterEach(function () {
		sandbox.restore();
	});


	describe('ci-object-setting-validation', function () {
		it('obj err validation', function () {

			expect(mdcLogObject).contain('app=apmod,domain=cand_info,function=api');
			expect(clMDC).contain('cls=CandidateInformationHandlerApplicationService');
			expect(clMDCErrWithAtt).contain('msg=Error: Invalid request parameters');

		});
	});
});

