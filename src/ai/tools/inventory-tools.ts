
'use server';
/**
 * @fileOverview Tools for the Inventory Daemon.
 * Interacts with the database to manage products, suppliers, and purchase orders.
 */
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { PurchaseOrderStatus } from '@prisma/client';

export const GetStockLevelsInputSchema = z.object({
  productId: z.string().describe("The unique identifier for the product."),
  workspaceId: z.string(),
});
export const GetStockLevelsOutputSchema = z.object({
  productId: z.string(),
  name: z.string(),
  stockLevel: z.number().int().describe("The current quantity in stock."),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock']),
});
export type GetStockLevelsOutput = z.infer<typeof GetStockLevelsOutputSchema>;

export async function getStockLevels(input: z.infer<typeof GetStockLevelsInputSchema>): Promise<GetStockLevelsOutput> {
  const { productId, workspaceId } = input;
  const product = await prisma.product.findFirst({
      where: { id: productId, workspaceId },
  });

  if (!product) {
      throw new Error(`Product with ID ${productId} not found in this workspace.`);
  }

  const { stockLevel } = product;
  let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
  if (stockLevel < 50) status = 'Low Stock';
  if (stockLevel === 0) status = 'Out of Stock';

  return { 
    productId: product.id, 
    name: product.name, 
    stockLevel, 
    status 
  };
}

export const PlacePurchaseOrderInputSchema = z.object({
    productId: z.string().describe("The product ID to reorder."),
    quantity: z.number().int().positive().describe("The quantity to order."),
    supplierId: z.string().describe("The ID of the supplier."),
    workspaceId: z.string(),
});
export const PlacePurchaseOrderOutputSchema = z.object({
    success: z.boolean(),
    orderId: z.string().describe("The new purchase order ID."),
    estimatedDeliveryDays: z.number().int(),
});
export type PlacePurchaseOrderOutput = z.infer<typeof PlacePurchaseOrderOutputSchema>;

export async function placePurchaseOrder(input: z.infer<typeof PlacePurchaseOrderInputSchema>): Promise<PlacePurchaseOrderOutput> {
    const { productId, quantity, supplierId, workspaceId } = input;
    
    // Verify product and supplier exist and belong to the workspace
    const [product, supplier] = await Promise.all([
        prisma.product.findFirst({ where: { id: productId, workspaceId } }),
        prisma.supplier.findFirst({ where: { id: supplierId, workspaceId } })
    ]);

    if (!product) throw new Error(`Product with ID ${productId} not found.`);
    if (!supplier) throw new Error(`Supplier with ID ${supplierId} not found.`);

    const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
            workspaceId,
            supplierId,
            status: PurchaseOrderStatus.PENDING,
            items: {
                create: {
                    productId,
                    quantity
                }
            }
        },
    });

    return {
        success: true,
        orderId: purchaseOrder.id,
        estimatedDeliveryDays: Math.floor(Math.random() * 7) + 3, // Keep this part random for now
    };
}
