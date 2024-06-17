import { Response } from "express";
import { Request } from "../../request";
import { stripeInstance } from "../../utils/stripe";

export default class Controller {
  protected readonly checkout = async (req: Request, res: Response) => {
    try {
      // const { data: priceData } = await stripeInstance().prices.list({
      //   active: true,
      //   limit: 100,
      //   expand: ["data.product"],
      //   // product: req.body.productId,
      // });
      // if (priceData.length !== 1) {
      //   res.status(422).json({ message: "Product id is required" });
      //   return;
      // }
      //   console.log(priceData);
      //   const ephemeralKey = await stripeInstance().ephemeralKeys.create(
      //     { customer: user.stripeAccount },
      //     { apiVersion: "2020-08-27" }
      //   );
      //   const paymentIntent = await stripeInstance().paymentIntents.create({
      //     amount: priceData[0].unit_amount,
      //     currency: priceData[0].currency,
      //     customer: user.stripeAccount,
      //     description: get(priceData, "0.product.name"),
      //     metadata: {
      //       price: priceData[0].id,
      //       product: get(priceData, "0.product.id"),
      //     },
      //   });
      //   console.log(user.stripeAccount, ephemeralKey, paymentIntent);
      //   res.status(200).json({
      //     paymentIntent: paymentIntent.client_secret,
      //     ephemeralKey: ephemeralKey.secret,
      //     customer: user.stripeAccount,
      //   });

      res.status(200).json({ message: "success" });
    } catch (e) {
      // Display error on client
      return res.send({ error: e.message });
    }
  };
}
