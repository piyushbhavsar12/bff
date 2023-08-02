import { assign } from 'xstate';
import { PrismaService } from "../../global-services/prisma.service";
const prismaService = new PrismaService()

export const promptActions = {
    updateUserAsValidated: assign<any, any>(async (context, event) => {
        await prismaService.user.update({
            where: {
                id:context.userId
            },
            data:{
                identifier: `${context.userAadhaarNumber}${context.lastAadhaarDigits}`,
                isVerified: true
            }
        })
        let ret =  {
          ...context
        }
        return ret
    }),

};
 