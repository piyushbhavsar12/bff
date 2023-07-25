export const AADHAAR_GREETING_MESSAGE = (
    BeneficiaryName,
    FatherName,
    DOB,
    Address,
    DateOfRegistration
) => `Dear ${BeneficiaryName},
Name: ${BeneficiaryName}
Father Name: ${FatherName}
Date Of Birth: ${DOB}
Address: ${Address}
Registration Date: ${DateOfRegistration}
`
