// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';
import {disableB2BTest, enableB2BTest} from '@commonTests/BO/shopParameters/b2b';
import {createOrderByCustomerTest} from '@commonTests/FO/order';

// Import pages
import outstandingPage from '@pages/BO/customers/outstanding';
import dashboardPage from '@pages/BO/dashboard';
import ordersPage from '@pages/BO/orders';
import {viewOrderBasePage} from '@pages/BO/orders/view/viewOrderBasePage';

// Import data
import Customers from '@data/demo/customer';
import OrderStatuses from '@data/demo/orderStatuses';
import {PaymentMethods} from '@data/demo/paymentMethods';
import type Order from '@data/types/order';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';

const baseContext: string = 'functional_BO_customers_outstanding_viewOrder';

/*
Pre-condition:
- Enable B2B
- Create order in FO
- Update order status to payment accepted
Scenario:
- View order from the outstanding page
Post-condition:
- Disable B2B
*/

describe('BO - Customers - Outstanding : View order', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  // Variable used for the last order ID created
  let orderId: string;
  // Variable used for the last order reference created
  let orderReference: string;
  // Variable for the last outstanding ID created
  let outstandingId: string;

  // New order by customer data
  const orderByCustomerData: Order = {
    customer: Customers.johnDoe,
    productId: 1,
    productQuantity: 1,
    paymentMethod: PaymentMethods.wirePayment.moduleName,
  };

  // Pre-Condition : Enable B2B
  enableB2BTest(baseContext);

  // Pre-condition: Create order in FO
  createOrderByCustomerTest(orderByCustomerData, baseContext);

  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  // Pre-condition: Update order status to payment accepted
  describe('PRE-TEST: Update order status to payment accepted', async () => {
    it('should login in BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    it('should go to \'Orders > Orders\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToOrdersPage', baseContext);

      await dashboardPage.goToSubMenu(
        page,
        dashboardPage.ordersParentLink,
        dashboardPage.ordersLink,
      );

      const pageTitle = await ordersPage.getPageTitle(page);
      await expect(pageTitle).to.contains(ordersPage.pageTitle);
    });

    it('should reset filter and get the last orderID and reference', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilterOrder', baseContext);

      await ordersPage.resetFilter(page);

      orderId = parseInt(
        await ordersPage.getTextColumn(page, 'id_order', 1),
        10,
      );
      await expect(orderId).to.be.at.least(1);

      orderReference = await ordersPage.getTextColumn(page, 'reference', 1);
      await expect(orderReference).to.not.equal('');
    });

    it('should update order status', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'updateOrderStatus', baseContext);

      const textResult = await ordersPage.setOrderStatus(page, 1, OrderStatuses.paymentAccepted);
      await expect(textResult).to.equal(ordersPage.successfulUpdateMessage);
    });

    it('should check that the status is updated successfully', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkStatusBO', baseContext);

      const orderStatus = await ordersPage.getTextColumn(page, 'osname', 1);
      await expect(orderStatus, 'Order status was not updated').to.equal(OrderStatuses.paymentAccepted.name);
    });
  });

  // 1 - View order from the outstanding page
  describe('View order from the outstanding page', async () => {
    it('should go to \'Customers > Outstanding\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToOutstandingPage', baseContext);

      await dashboardPage.goToSubMenu(
        page,
        dashboardPage.customersParentLink,
        dashboardPage.outstandingLink,
      );
      await outstandingPage.closeSfToolBar(page);

      const pageTitle = await outstandingPage.getPageTitle(page);
      await expect(pageTitle).to.contains(outstandingPage.pageTitle);
    });

    it('should reset filter and get the last outstanding ID', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilterOutstanding', baseContext);

      await outstandingPage.resetFilter(page);

      outstandingId = await outstandingPage.getTextColumn(page, 'id_invoice', 1) as string;
      await expect(outstandingId).to.be.at.least(1);
    });

    it('should view the Order and check the orderID and the reference', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'viewOrder', baseContext);

      await outstandingPage.viewOrder(page, 'actions', 1);

      const outstandingOrderId = await viewOrderBasePage.getOrderID(page);
      const outstandingOrderReference = await viewOrderBasePage.getOrderReference(page);

      [
        {args: {columnName: outstandingOrderId, result: orderId}},
        {args: {columnName: outstandingOrderReference, result: orderReference}},
      ].forEach((test) => {
        expect(test.args.columnName).to.be.equal(test.args.result);
      });
    });
  });

  // Post-Condition : Disable B2B
  disableB2BTest(baseContext);
});
