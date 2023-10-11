import * as moment from 'moment';
import { addOrdinalSuffix } from './utils';

export const AADHAAR_GREETING_MESSAGE = (
    BeneficiaryName,
    FatherName,
    DOB,
    Address,
    DateOfRegistration,
    LatestInstallmentPaid,
    Reg_No,
    StateName,
    DistrictName,
    SubDistrictName,
    VillageName,
    eKYC_Status
) => `Beneficiary Name - ${BeneficiaryName}
State - ${StateName}, ${DistrictName}, ${SubDistrictName}, ${VillageName}
Registration Number - ${Reg_No}
Registration Date - ${moment(DateOfRegistration).format('DD-MM-YYYY')}
Last Installment Status - ${LatestInstallmentPaid==0?"No":addOrdinalSuffix(LatestInstallmentPaid)} Installment payment done
ekyc - ${eKYC_Status=='Y'?'Done':'Not Done'} 
`
