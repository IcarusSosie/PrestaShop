// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

// Import pages
import dashboardPage from '@pages/BO/dashboard/index';
import pagesPage from '@pages/BO/design/pages/index';

// Import data
import CMSPages from '@data/demo/CMSpage';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';

const baseContext: string = 'functional_BO_design_pages_pages_filterAndQuickEditPages';

/*
Filter pages table by : ID, Link, Meta title, Position and Displayed
Enable/Disable page status by quick edit
 */
describe('BO - Design - Pages : Filter and quick edit pages table', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  let numberOfPages: number = 0;

  const pagesTableName: string = 'cms_page';

  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  it('should go to \'Design > Pages\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToCmsPagesPage', baseContext);

    await dashboardPage.goToSubMenu(
      page,
      dashboardPage.designParentLink,
      dashboardPage.pagesLink,
    );
    await pagesPage.closeSfToolBar(page);

    const pageTitle = await pagesPage.getPageTitle(page);
    await expect(pageTitle).to.contains(pagesPage.pageTitle);
  });

  it('should reset all filters and get number of pages in BO', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetFiltersFirst', baseContext);

    numberOfPages = await pagesPage.resetAndGetNumberOfLines(page, pagesTableName);
    await expect(numberOfPages).to.be.above(0);
  });

  // 1 : Filter pages with all inputs and selects in grid table
  describe('Filter pages table', async () => {
    const tests = [
      {
        args:
          {
            testIdentifier: 'filterById',
            filterType: 'input',
            filterBy: 'id_cms',
            filterValue: CMSPages.delivery.id.toString(),
          },
      },
      {
        args:
          {
            testIdentifier: 'filterByLink',
            filterType: 'input',
            filterBy: 'link_rewrite',
            filterValue: CMSPages.aboutUs.url,
          },
      },
      {
        args:
          {
            testIdentifier: 'filterByMetaTitle',
            filterType: 'input',
            filterBy: 'meta_title',
            filterValue: CMSPages.termsAndCondition.title,
          },
      },
      {
        args:
          {
            testIdentifier: 'filterByPosition',
            filterType: 'input',
            filterBy: 'position',
            filterValue: CMSPages.securePayment.position.toString(),
          },
      },
      {
        args:
          {
            testIdentifier: 'filterByActive',
            filterType: 'select',
            filterBy: 'active',
            filterValue: CMSPages.securePayment.displayed ? '1' : '0',
          },
      },
    ];

    tests.forEach((test) => {
      it(`should filter by ${test.args.filterBy} '${test.args.filterValue}'`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', test.args.testIdentifier, baseContext);

        await pagesPage.filterTable(
          page,
          pagesTableName,
          test.args.filterType,
          test.args.filterBy,
          test.args.filterValue,
        );

        const numberOfPagesAfterFilter = await pagesPage.getNumberOfElementInGrid(page, pagesTableName);
        await expect(numberOfPagesAfterFilter).to.be.at.most(numberOfPages);

        for (let i = 1; i <= numberOfPagesAfterFilter; i++) {
          if (test.args.filterBy === 'active') {
            const pagesStatus = await pagesPage.getStatus(page, pagesTableName, i);
            await expect(pagesStatus).to.equal(test.args.filterValue === '1');
          } else {
            const textColumn = await pagesPage.getTextColumnFromTableCmsPage(page, i, test.args.filterBy);
            await expect(textColumn).to.contains(test.args.filterValue);
          }
        }
      });

      it('should reset all filters', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `reset_${test.args.testIdentifier}`, baseContext);

        const numberOfPagesAfterReset = await pagesPage.resetAndGetNumberOfLines(page, pagesTableName);
        await expect(numberOfPagesAfterReset).to.be.equal(numberOfPages);
      });
    });
  });

  // 2 : Editing pages from grid table
  describe('Quick edit pages', async () => {
    it('should filter by Title \'Terms and conditions of use\'', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'quickEditFilter', baseContext);

      await pagesPage.filterTable(
        page,
        pagesTableName,
        'input',
        'meta_title',
        CMSPages.termsAndCondition.title,
      );

      const numberOfPagesAfterFilter = await pagesPage.getNumberOfElementInGrid(page, pagesTableName);

      if (numberOfPages === 0) {
        await expect(numberOfPagesAfterFilter).to.be.equal(numberOfPages + 1);
      } else {
        await expect(numberOfPagesAfterFilter).to.be.at.most(numberOfPages);
      }

      const textColumn = await pagesPage.getTextColumnFromTableCmsPage(page, 1, 'meta_title');
      await expect(textColumn).to.contains(CMSPages.termsAndCondition.title);
    });

    [
      {args: {status: 'disable', enable: false}},
      {args: {status: 'enable', enable: true}},
    ].forEach((pageStatus) => {
      it(`should ${pageStatus.args.status} the page`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `${pageStatus.args.status}Page`, baseContext);

        const isActionPerformed = await pagesPage.setStatus(page, pagesTableName, 1, pageStatus.args.enable);

        if (isActionPerformed) {
          const resultMessage = await pagesPage.getAlertSuccessBlockParagraphContent(page);
          await expect(resultMessage).to.contains(pagesPage.successfulUpdateStatusMessage);
        }

        const currentStatus = await pagesPage.getStatus(page, pagesTableName, 1);
        await expect(currentStatus).to.be.equal(pageStatus.args.enable);
      });
    });

    it('should reset all filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'quickEditReset', baseContext);

      const numberOfPagesAfterReset = await pagesPage.resetAndGetNumberOfLines(page, pagesTableName);
      await expect(numberOfPagesAfterReset).to.be.equal(numberOfPages);
    });
  });
});
