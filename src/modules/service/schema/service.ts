import { Schema, model } from "mongoose";
import { IService } from "../types";
import axios from "axios";

const service = new Schema<IService>(
  {
    name: {
      type: String,
    },
    waitWhileServiceId: {
      type: String,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const ServiceModel = model<IService>("service", service);

ServiceModel.watch().on("change", async (change) => {
  console.log("Change detected:", change);

  if (change.operationType === "delete") {
    const serviceId = change.documentKey._id;
    console.log("**************", serviceId);

    const serviceDocument = await ServiceModel.findById(serviceId);
    if (!serviceDocument) {
      console.log(`Service document with ID ${serviceId} not found.`);
      return;
    }

    const waitWhileServiceId = serviceDocument.waitWhileServiceId;

    const option = {
      url: `${process.env.WAITWHILE_BASE_URL}/services/${waitWhileServiceId}`,
      method: "DELETE",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        apikey: `${process.env.WAIT_WHILE_KEY}`,
      },
    };

    try {
      await axios(option);
      console.log(
        `Service with ID ${waitWhileServiceId} removed successfully from WaitWhile.`
      );
    } catch (error) {
      console.error(
        `Failed to remove service with ID ${waitWhileServiceId} from WaitWhile:`,
        error
      );
    }
  }
});
