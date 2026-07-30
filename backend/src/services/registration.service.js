import prisma from "../config/prisma.js";

// GET ALL
export const getRegistrationsService = async () => {

    return await prisma.registration.findMany({

        include:{
            patient:true,
            doctor:true,
            polyclinic:true
        },

        orderBy:{
            id:"desc"
        }

    });

};

// GET BY ID
export const getRegistrationByIdService = async(id)=>{

    return await prisma.registration.findUnique({

        where:{
            id:Number(id)
        },

        include:{
            patient:true,
            doctor:true,
            polyclinic:true
        }

    });

};

// CREATE
export const createRegistrationService = async(data)=>{


    return await prisma.registration.create({

        data:{
            patientId:Number(data.patientId),
            doctorId:Number(data.doctorId),
            polyclinicId:Number(data.polyclinicId),

            visitDate:new Date(data.visitDate),

            paymentType:data.paymentType,

            complaint:data.complaint,

            status:"WAITING"
        }

    });


};

// UPDATE
export const updateRegistrationService = async(id,data)=>{


    return await prisma.registration.update({

        where:{
            id:Number(id)
        },

        data:{
            doctorId:Number(data.doctorId),
            polyclinicId:Number(data.polyclinicId),
            visitDate:new Date(data.visitDate),
            paymentType:data.paymentType,
            complaint:data.complaint
        }

    });


};

// DELETE
export const deleteRegistrationService = async(id)=>{

    return await prisma.registration.delete({

        where:{
            id:Number(id)
        }

    });

};