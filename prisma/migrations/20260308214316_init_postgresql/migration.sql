-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('HOMBRE', 'DAMA', 'UNISEX');

-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('TERNO', 'SACO', 'PANTALON', 'CAMISA', 'BLUSA', 'CHALECO', 'ACCESORIO', 'SMOKING', 'BUNDLE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVO', 'AGOTADO', 'TEMPORALMENTE_NO_DISPONIBLE', 'INACTIVO');

-- CreateEnum
CREATE TYPE "StockTrackingMode" AS ENUM ('NONE', 'VARIANT', 'INDIVIDUAL', 'MIXED');

-- CreateEnum
CREATE TYPE "AttributeScope" AS ENUM ('PRODUCT', 'VARIANT');

-- CreateEnum
CREATE TYPE "InputFieldType" AS ENUM ('SELECT', 'MULTISELECT', 'TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'COLOR');

-- CreateEnum
CREATE TYPE "MeasurementGarmentType" AS ENUM ('SACO_CABALLERO', 'PANTALON_CABALLERO', 'SACO_DAMA', 'PANTALON_DAMA', 'CAMISA', 'BLUSA', 'CHALECO', 'FALDA', 'SMOKING');

-- CreateEnum
CREATE TYPE "FabricPriceMode" AS ENUM ('A_TODO_COSTO', 'SOLO_CONFECCION');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('TOMA_MEDIDAS', 'ARREGLO', 'ENTREGA', 'ASESORIA', 'OTRA');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA', 'CANCELADA', 'NO_ASISTIO', 'REALIZADA');

-- CreateEnum
CREATE TYPE "SaleOrderStatus" AS ENUM ('PENDIENTE_PAGO', 'PAGADO', 'EN_PREPARACION', 'LISTO_PARA_RECOJO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "CustomOrderStatus" AS ENUM ('PENDIENTE_RESERVA', 'RESERVA_CONFIRMADA', 'MEDIDAS_TOMADAS', 'EN_CONFECCION', 'EN_PRUEBA', 'LISTO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "RentalOrderStatus" AS ENUM ('RESERVADO', 'ENTREGADO', 'DEVUELTO', 'ATRASADO', 'CERRADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "AlterationOrderStatus" AS ENUM ('RECIBIDO', 'EN_EVALUACION', 'EN_PROCESO', 'LISTO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "RentalUnitStatus" AS ENUM ('DISPONIBLE', 'ALQUILADO', 'EN_MANTENIMIENTO', 'DANADO', 'RETIRADO');

-- CreateEnum
CREATE TYPE "RentalPriceTier" AS ENUM ('ESTRENO', 'NORMAL');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('INGRESO', 'AJUSTE', 'VENTA', 'ALQUILER', 'DEVOLUCION', 'MERMA', 'REPARACION');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA', 'TARJETA', 'MIXTO', 'OTRO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDIENTE', 'APROBADO', 'OBSERVADO', 'ANULADO', 'DEVUELTO');

-- CreateEnum
CREATE TYPE "PaymentConcept" AS ENUM ('ADELANTO', 'SALDO', 'PAGO_TOTAL', 'RESERVA_CITA', 'OTRO');

-- CreateEnum
CREATE TYPE "VoucherProvider" AS ENUM ('YAPE', 'PLIN', 'BANCO', 'OTRO');

-- CreateEnum
CREATE TYPE "ComprobanteType" AS ENUM ('BOLETA', 'FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO', 'TICKET');

-- CreateEnum
CREATE TYPE "ComprobanteStatus" AS ENUM ('BORRADOR', 'EMITIDO', 'ANULADO');

-- CreateEnum
CREATE TYPE "PromotionScope" AS ENUM ('ORDEN', 'PRODUCTO', 'BUNDLE');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PORCENTAJE', 'MONTO_FIJO');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'INTERNO');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDIENTE', 'ENVIADA', 'FALLIDA', 'LEIDA');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "authUserId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "authUserId" TEXT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "celular" TEXT,
    "dni" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "adminUserId" INTEGER,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerFile" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "kind" "ProductKind" NOT NULL,
    "gender" "Gender",
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVO',
    "stockTrackingMode" "StockTrackingMode" NOT NULL DEFAULT 'VARIANT',
    "requiresMeasurement" BOOLEAN NOT NULL DEFAULT false,
    "allowsSale" BOOLEAN NOT NULL DEFAULT true,
    "allowsRental" BOOLEAN NOT NULL DEFAULT false,
    "allowsCustomization" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "brandId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "talla" TEXT,
    "tallaSecundaria" TEXT,
    "color" TEXT,
    "colorCodigo" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "salePrice" DECIMAL(10,2) NOT NULL,
    "compareAtPrice" DECIMAL(10,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogAttributeDefinition" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "scope" "AttributeScope" NOT NULL,
    "inputType" "InputFieldType" NOT NULL,
    "appliesToKind" "ProductKind",
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogAttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogAttributeOption" (
    "id" SERIAL NOT NULL,
    "definitionId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CatalogAttributeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttributeValue" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "definitionId" INTEGER NOT NULL,
    "optionId" INTEGER,
    "valueText" TEXT,
    "valueNumber" DECIMAL(10,2),
    "valueBoolean" BOOLEAN,

    CONSTRAINT "ProductAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantAttributeValue" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "definitionId" INTEGER NOT NULL,
    "optionId" INTEGER,
    "valueText" TEXT,
    "valueNumber" DECIMAL(10,2),
    "valueBoolean" BOOLEAN,

    CONSTRAINT "VariantAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductComponent" (
    "id" SERIAL NOT NULL,
    "parentProductId" INTEGER NOT NULL,
    "childProductId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleItem" (
    "id" SERIAL NOT NULL,
    "bundleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleVariantItem" (
    "id" SERIAL NOT NULL,
    "bundleId" INTEGER NOT NULL,
    "variantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BundleVariantItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementField" (
    "id" SERIAL NOT NULL,
    "garmentType" "MeasurementGarmentType" NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementProfile" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementProfileGarment" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "garmentType" "MeasurementGarmentType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementProfileGarment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementValue" (
    "id" SERIAL NOT NULL,
    "garmentId" INTEGER NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "valueNumber" DECIMAL(10,2),
    "valueText" TEXT,

    CONSTRAINT "MeasurementValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomizationDefinition" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "garmentType" "MeasurementGarmentType" NOT NULL,
    "inputType" "InputFieldType" NOT NULL,
    "allowFreeText" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "productId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomizationDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomizationOption" (
    "id" SERIAL NOT NULL,
    "definitionId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "extraPrice" DECIMAL(10,2),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CustomizationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fabric" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT,
    "supplier" TEXT,
    "composition" TEXT,
    "pattern" TEXT,
    "metersInStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "minMeters" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costPerMeter" DECIMAL(10,2),
    "pricePerMeter" DECIMAL(10,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fabric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FabricMovement" (
    "id" SERIAL NOT NULL,
    "fabricId" INTEGER NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FabricMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleOrder" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" "SaleOrderStatus" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preparedAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleOrderItem" (
    "id" SERIAL NOT NULL,
    "saleOrderId" INTEGER NOT NULL,
    "productId" INTEGER,
    "bundleId" INTEGER,
    "itemNameSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleOrderItemComponent" (
    "id" SERIAL NOT NULL,
    "saleOrderItemId" INTEGER NOT NULL,
    "productId" INTEGER,
    "variantId" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SaleOrderItemComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrder" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" "CustomOrderStatus" NOT NULL DEFAULT 'PENDIENTE_RESERVA',
    "requiresMeasurement" BOOLEAN NOT NULL DEFAULT true,
    "measurementRequiredUntil" TIMESTAMP(3),
    "firstPurchaseFlow" BOOLEAN NOT NULL DEFAULT false,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "requestedDeliveryAt" TIMESTAMP(3),
    "promisedDeliveryAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "notes" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrderItem" (
    "id" SERIAL NOT NULL,
    "customOrderId" INTEGER NOT NULL,
    "productId" INTEGER,
    "itemNameSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrderItemPart" (
    "id" SERIAL NOT NULL,
    "customOrderItemId" INTEGER NOT NULL,
    "productId" INTEGER,
    "garmentType" "MeasurementGarmentType" NOT NULL,
    "label" TEXT NOT NULL,
    "workMode" "FabricPriceMode" NOT NULL DEFAULT 'A_TODO_COSTO',
    "measurementProfileId" INTEGER,
    "measurementProfileGarmentId" INTEGER,
    "fabricId" INTEGER,
    "fabricNameSnapshot" TEXT,
    "fabricCodeSnapshot" TEXT,
    "fabricColorSnapshot" TEXT,
    "unitPrice" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrderItemPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrderItemPartSelection" (
    "id" SERIAL NOT NULL,
    "customOrderItemPartId" INTEGER NOT NULL,
    "definitionId" INTEGER NOT NULL,
    "optionId" INTEGER,
    "definitionCodeSnapshot" TEXT NOT NULL,
    "definitionLabelSnapshot" TEXT NOT NULL,
    "inputTypeSnapshot" "InputFieldType" NOT NULL,
    "optionCodeSnapshot" TEXT,
    "optionLabelSnapshot" TEXT,
    "extraPriceSnapshot" DECIMAL(10,2),
    "valueText" TEXT,
    "valueNumber" DECIMAL(10,2),
    "valueBoolean" BOOLEAN,

    CONSTRAINT "CustomOrderItemPartSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalUnit" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "internalCode" TEXT NOT NULL,
    "sizeLabel" TEXT,
    "color" TEXT,
    "currentTier" "RentalPriceTier" NOT NULL DEFAULT 'ESTRENO',
    "normalPrice" DECIMAL(10,2) NOT NULL,
    "premierePrice" DECIMAL(10,2) NOT NULL,
    "status" "RentalUnitStatus" NOT NULL DEFAULT 'DISPONIBLE',
    "notes" TEXT,
    "firstRentedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalUnitMovement" (
    "id" SERIAL NOT NULL,
    "rentalUnitId" INTEGER NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "note" TEXT,
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalUnitMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalOrder" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" "RentalOrderStatus" NOT NULL DEFAULT 'RESERVADO',
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pickupAt" TIMESTAMP(3) NOT NULL,
    "dueBackAt" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "hasDelay" BOOLEAN NOT NULL DEFAULT false,
    "hasDamage" BOOLEAN NOT NULL DEFAULT false,
    "returnNotes" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalOrderItem" (
    "id" SERIAL NOT NULL,
    "rentalOrderId" INTEGER NOT NULL,
    "productId" INTEGER,
    "rentalUnitId" INTEGER NOT NULL,
    "itemNameSnapshot" TEXT NOT NULL,
    "tierAtRental" "RentalPriceTier" NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "returnCondition" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlterationService" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioBase" DECIMAL(10,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlterationService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlterationOrder" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" "AlterationOrderStatus" NOT NULL DEFAULT 'RECIBIDO',
    "serviceId" INTEGER,
    "garmentDescription" TEXT NOT NULL,
    "workDescription" TEXT NOT NULL,
    "initialCondition" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "promisedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlterationOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "estimatedEndAt" TIMESTAMP(3),
    "rescheduleDeadlineAt" TIMESTAMP(3),
    "cancelDeadlineAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "attendedAt" TIMESTAMP(3),
    "noShowAt" TIMESTAMP(3),
    "reminder24hSentAt" TIMESTAMP(3),
    "notes" TEXT,
    "internalNotes" TEXT,
    "saleOrderId" INTEGER,
    "customOrderId" INTEGER,
    "rentalOrderId" INTEGER,
    "alterationOrderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentStatusHistory" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" INTEGER,

    CONSTRAINT "AppointmentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessHour" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,

    CONSTRAINT "BusinessHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialSchedule" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,

    CONSTRAINT "SpecialSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "saleOrderId" INTEGER,
    "customOrderId" INTEGER,
    "rentalOrderId" INTEGER,
    "alterationOrderId" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "concept" "PaymentConcept" NOT NULL DEFAULT 'PAGO_TOTAL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "provider" "VoucherProvider",
    "operationCode" TEXT,
    "approvalCode" TEXT,
    "voucherUrl" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comprobante" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "saleOrderId" INTEGER,
    "customOrderId" INTEGER,
    "rentalOrderId" INTEGER,
    "alterationOrderId" INTEGER,
    "type" "ComprobanteType" NOT NULL,
    "status" "ComprobanteStatus" NOT NULL DEFAULT 'BORRADOR',
    "serie" TEXT,
    "numero" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "impuesto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "issuedAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "xmlUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comprobante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductStockMovement" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT,
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductStockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "scope" "PromotionScope" NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "promotionId" INTEGER,
    "bundleId" INTEGER,
    "discountType" "DiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderCouponUse" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "saleOrderId" INTEGER,
    "customOrderId" INTEGER,
    "rentalOrderId" INTEGER,
    "alterationOrderId" INTEGER,
    "appliedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderCouponUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDIENTE',
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "relatedCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleOrderStatusHistory" (
    "id" SERIAL NOT NULL,
    "saleOrderId" INTEGER NOT NULL,
    "status" "SaleOrderStatus" NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" INTEGER,

    CONSTRAINT "SaleOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrderStatusHistory" (
    "id" SERIAL NOT NULL,
    "customOrderId" INTEGER NOT NULL,
    "status" "CustomOrderStatus" NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" INTEGER,

    CONSTRAINT "CustomOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalOrderStatusHistory" (
    "id" SERIAL NOT NULL,
    "rentalOrderId" INTEGER NOT NULL,
    "status" "RentalOrderStatus" NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" INTEGER,

    CONSTRAINT "RentalOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlterationOrderStatusHistory" (
    "id" SERIAL NOT NULL,
    "alterationOrderId" INTEGER NOT NULL,
    "status" "AlterationOrderStatus" NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" INTEGER,

    CONSTRAINT "AlterationOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_authUserId_key" ON "AdminUser"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_authUserId_key" ON "Customer"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_dni_key" ON "Customer"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_nombre_key" ON "Brand"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogAttributeDefinition_code_scope_key" ON "CatalogAttributeDefinition"("code", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogAttributeOption_definitionId_code_key" ON "CatalogAttributeOption"("definitionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeValue_productId_definitionId_key" ON "ProductAttributeValue"("productId", "definitionId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantAttributeValue_variantId_definitionId_key" ON "VariantAttributeValue"("variantId", "definitionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductComponent_parentProductId_childProductId_key" ON "ProductComponent"("parentProductId", "childProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_slug_key" ON "Bundle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BundleItem_bundleId_productId_key" ON "BundleItem"("bundleId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleVariantItem_bundleId_variantId_key" ON "BundleVariantItem"("bundleId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "MeasurementField_garmentType_code_key" ON "MeasurementField"("garmentType", "code");

-- CreateIndex
CREATE UNIQUE INDEX "MeasurementProfileGarment_profileId_garmentType_key" ON "MeasurementProfileGarment"("profileId", "garmentType");

-- CreateIndex
CREATE UNIQUE INDEX "MeasurementValue_garmentId_fieldId_key" ON "MeasurementValue"("garmentId", "fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomizationDefinition_code_key" ON "CustomizationDefinition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomizationOption_definitionId_code_key" ON "CustomizationOption"("definitionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Fabric_code_key" ON "Fabric"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SaleOrder_code_key" ON "SaleOrder"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrder_code_key" ON "CustomOrder"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrderItemPartSelection_customOrderItemPartId_definiti_key" ON "CustomOrderItemPartSelection"("customOrderItemPartId", "definitionId");

-- CreateIndex
CREATE UNIQUE INDEX "RentalUnit_internalCode_key" ON "RentalUnit"("internalCode");

-- CreateIndex
CREATE UNIQUE INDEX "RentalOrder_code_key" ON "RentalOrder"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AlterationOrder_code_key" ON "AlterationOrder"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_code_key" ON "Appointment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessHour_dayOfWeek_key" ON "BusinessHour"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialSchedule_date_key" ON "SpecialSchedule"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFile" ADD CONSTRAINT "CustomerFile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogAttributeOption" ADD CONSTRAINT "CatalogAttributeOption_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "CatalogAttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "CatalogAttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "CatalogAttributeOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "CatalogAttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "CatalogAttributeOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductComponent" ADD CONSTRAINT "ProductComponent_parentProductId_fkey" FOREIGN KEY ("parentProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductComponent" ADD CONSTRAINT "ProductComponent_childProductId_fkey" FOREIGN KEY ("childProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleVariantItem" ADD CONSTRAINT "BundleVariantItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleVariantItem" ADD CONSTRAINT "BundleVariantItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementProfile" ADD CONSTRAINT "MeasurementProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementProfileGarment" ADD CONSTRAINT "MeasurementProfileGarment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "MeasurementProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementValue" ADD CONSTRAINT "MeasurementValue_garmentId_fkey" FOREIGN KEY ("garmentId") REFERENCES "MeasurementProfileGarment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementValue" ADD CONSTRAINT "MeasurementValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "MeasurementField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomizationDefinition" ADD CONSTRAINT "CustomizationDefinition_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomizationOption" ADD CONSTRAINT "CustomizationOption_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "CustomizationDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricMovement" ADD CONSTRAINT "FabricMovement_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrder" ADD CONSTRAINT "SaleOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderItem" ADD CONSTRAINT "SaleOrderItem_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "SaleOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderItem" ADD CONSTRAINT "SaleOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderItem" ADD CONSTRAINT "SaleOrderItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderItemComponent" ADD CONSTRAINT "SaleOrderItemComponent_saleOrderItemId_fkey" FOREIGN KEY ("saleOrderItemId") REFERENCES "SaleOrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderItemComponent" ADD CONSTRAINT "SaleOrderItemComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderItemComponent" ADD CONSTRAINT "SaleOrderItemComponent_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrder" ADD CONSTRAINT "CustomOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderItem" ADD CONSTRAINT "CustomOrderItem_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderItem" ADD CONSTRAINT "CustomOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderItemPart" ADD CONSTRAINT "CustomOrderItemPart_customOrderItemId_fkey" FOREIGN KEY ("customOrderItemId") REFERENCES "CustomOrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderItemPart" ADD CONSTRAINT "CustomOrderItemPart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderItemPart" ADD CONSTRAINT "CustomOrderItemPart_measurementProfileId_fkey" FOREIGN KEY ("measurementProfileId") REFERENCES "MeasurementProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderItemPart" ADD CONSTRAINT "CustomOrderItemPart_measurementProfileGarmentId_fkey" FOREIGN KEY ("measurementProfileGarmentId") REFERENCES "MeasurementProfileGarment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderItemPart" ADD CONSTRAINT "CustomOrderItemPart_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderItemPartSelection" ADD CONSTRAINT "CustomOrderItemPartSelection_customOrderItemPartId_fkey" FOREIGN KEY ("customOrderItemPartId") REFERENCES "CustomOrderItemPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderItemPartSelection" ADD CONSTRAINT "CustomOrderItemPartSelection_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "CustomizationDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderItemPartSelection" ADD CONSTRAINT "CustomOrderItemPartSelection_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "CustomizationOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalUnit" ADD CONSTRAINT "RentalUnit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalUnit" ADD CONSTRAINT "RentalUnit_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalUnitMovement" ADD CONSTRAINT "RentalUnitMovement_rentalUnitId_fkey" FOREIGN KEY ("rentalUnitId") REFERENCES "RentalUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrder" ADD CONSTRAINT "RentalOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrderItem" ADD CONSTRAINT "RentalOrderItem_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrderItem" ADD CONSTRAINT "RentalOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrderItem" ADD CONSTRAINT "RentalOrderItem_rentalUnitId_fkey" FOREIGN KEY ("rentalUnitId") REFERENCES "RentalUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlterationOrder" ADD CONSTRAINT "AlterationOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlterationOrder" ADD CONSTRAINT "AlterationOrder_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "AlterationService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "SaleOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_alterationOrderId_fkey" FOREIGN KEY ("alterationOrderId") REFERENCES "AlterationOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "SaleOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_alterationOrderId_fkey" FOREIGN KEY ("alterationOrderId") REFERENCES "AlterationOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprobante" ADD CONSTRAINT "Comprobante_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprobante" ADD CONSTRAINT "Comprobante_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "SaleOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprobante" ADD CONSTRAINT "Comprobante_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprobante" ADD CONSTRAINT "Comprobante_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprobante" ADD CONSTRAINT "Comprobante_alterationOrderId_fkey" FOREIGN KEY ("alterationOrderId") REFERENCES "AlterationOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStockMovement" ADD CONSTRAINT "ProductStockMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCouponUse" ADD CONSTRAINT "OrderCouponUse_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCouponUse" ADD CONSTRAINT "OrderCouponUse_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "SaleOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCouponUse" ADD CONSTRAINT "OrderCouponUse_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCouponUse" ADD CONSTRAINT "OrderCouponUse_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCouponUse" ADD CONSTRAINT "OrderCouponUse_alterationOrderId_fkey" FOREIGN KEY ("alterationOrderId") REFERENCES "AlterationOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderStatusHistory" ADD CONSTRAINT "SaleOrderStatusHistory_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "SaleOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderStatusHistory" ADD CONSTRAINT "SaleOrderStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderStatusHistory" ADD CONSTRAINT "CustomOrderStatusHistory_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderStatusHistory" ADD CONSTRAINT "CustomOrderStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrderStatusHistory" ADD CONSTRAINT "RentalOrderStatusHistory_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrderStatusHistory" ADD CONSTRAINT "RentalOrderStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlterationOrderStatusHistory" ADD CONSTRAINT "AlterationOrderStatusHistory_alterationOrderId_fkey" FOREIGN KEY ("alterationOrderId") REFERENCES "AlterationOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlterationOrderStatusHistory" ADD CONSTRAINT "AlterationOrderStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
