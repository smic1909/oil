import * as CoreUtils from '../../../src/scripts/core/core_utils';
import * as CoreConfig from '../../../src/scripts/core/core_config';
import {clearVendorListCache, loadVendorList} from '../../../src/scripts/core/core_vendor_information';

describe('core_vendor_information', () => {

  let vendorList = {
    'vendorListVersion': 1,
    'lastUpdated': '2018-05-23T16:00:15Z',
    'purposes': [
      {
        'id': 1,
        'name': 'Information storage and access',
        'description': 'The storage of information, or access to information that is already stored, on your device such as advertising identifiers, device identifiers, cookies, and similar technologies.'
      },
      {
        'id': 2,
        'name': 'Personalisation',
        'description': 'The collection and processing of information about your use of this service to subsequently personalise advertising and/or content for you in other contexts, such as on other websites or apps, over time. Typically, the content of the site or app is used to make inferences about your interests, which inform future selection of advertising and/or content.'
      },
      {
        'id': 3,
        'name': 'Ad selection, delivery, reporting',
        'description': 'The collection of information, and combination with previously collected information, to select and deliver advertisements for you, and to measure the delivery and effectiveness of such advertisements. This includes using previously collected information about your interests to select ads, processing data about what advertisements were shown, how often they were shown, when and where they were shown, and whether you took any action related to the advertisement, including for example clicking an ad or making a purchase. This does not include personalisation, which is the collection and processing of information about your use of this service to subsequently personalise advertising and/or content for you in other contexts, such as websites or apps, over time.'
      },
      {
        'id': 4,
        'name': 'Content selection, delivery, reporting',
        'description': 'The collection of information, and combination with previously collected information, to select and deliver content for you, and to measure the delivery and effectiveness of such content. This includes using previously collected information about your interests to select content, processing data about what content was shown, how often or how long it was shown, when and where it was shown, and whether the you took any action related to the content, including for example clicking on content. This does not include personalisation, which is the collection and processing of information about your use of this service to subsequently personalise content and/or advertising for you in other contexts, such as websites or apps, over time.'
      },
      {
        'id': 5,
        'name': 'Measurement',
        'description': 'The collection of information about your use of the content, and combination with previously collected information, used to measure, understand, and report on your usage of the service. This does not include personalisation, the collection of information about your use of this service to subsequently personalise content and/or advertising for you in other contexts, i.e. on other service, such as websites or apps, over time.'
      }
    ],
    'features': [
      {
        'id': 1,
        'name': 'Matching Data to Offline Sources',
        'description': 'Combining data from offline sources that were initially collected in other contexts.'
      },
      {
        'id': 2,
        'name': 'Linking Devices',
        'description': 'Allow processing of a user\'s data to connect such user across multiple devices.'
      },
      {
        'id': 3,
        'name': 'Precise Geographic Location Data',
        'description': 'Allow processing of a user\'s precise geographic location data in support of a purpose for which that certain third party has consent.'
      }
    ],
    'vendors': [
      {
        'id': 24,
        'name': 'Emerse Sverige AB',
        'policyUrl': 'https://www.emerse.com/privacy-policy/',
        'purposeIds': [1, 2, 4],
        'legIntPurposeIds': [3, 5],
        'featureIds': [1, 2]
      },
      {
        'id': 12,
        'name': 'BeeswaxIO Corporation',
        'policyUrl': 'https://www.beeswax.com/privacy.html',
        'purposeIds': [1, 3, 5],
        'legIntPurposeIds': [],
        'featureIds': [3]
      }
    ]
  };

  beforeEach(() => {
    clearVendorListCache();
  });

  it('should load vendor list from remote url', (done) => {
    spyOn(CoreUtils, 'fetchJsonData').and.returnValue(new Promise((resolve) => resolve(vendorList)));
    spyOn(CoreConfig, 'getIabVendorListUrl').and.returnValue("https://iab.vendor.list.url");

    loadVendorList().then((retrievedVendorList) => {
      expect(retrievedVendorList.vendorListVersion).toEqual(1);
      expect(retrievedVendorList).toEqual(vendorList);
      expect(areVendorsSortedById(retrievedVendorList)).toBeTruthy();
      done();
    });
  });

  it('should use cached vendor list if there is one', (done) => {
    let fetchSpy = spyOn(CoreUtils, 'fetchJsonData').and.returnValue(new Promise((resolve) => resolve(vendorList)));
    spyOn(CoreConfig, 'getIabVendorListUrl').and.returnValue("https://iab.vendor.list.url");

    loadVendorList().then(() => {
      expect(CoreUtils.fetchJsonData).toHaveBeenCalled();
      fetchSpy.calls.reset();

      loadVendorList().then(() => {
        expect(CoreUtils.fetchJsonData).not.toHaveBeenCalled();
        done();
      });
    });
  });

  it('should use default vendor list if IAB vendor list url is not configured', (done) => {
    spyOn(CoreUtils, 'fetchJsonData').and.callThrough();
    spyOn(CoreConfig, 'getIabVendorListUrl').and.returnValue(undefined);

    loadVendorList().then((retrievedVendorList) => {
      expect(CoreUtils.fetchJsonData).not.toHaveBeenCalled();
      expect(retrievedVendorList.vendorListVersion).toEqual(27);
      expect(areVendorsSortedById(retrievedVendorList)).toBeTruthy();
      done();
    });
  });

  it('should use default vendor list if vendor list fetching fails', (done) => {
    spyOn(CoreUtils, 'fetchJsonData').and.returnValue(new Promise((resolve, reject) => reject(new Error("something went wrong"))));
    spyOn(CoreConfig, 'getIabVendorListUrl').and.returnValue("https://iab.vendor.list.url");

    loadVendorList().then((retrievedVendorList) => {
      expect(CoreUtils.fetchJsonData).toHaveBeenCalled();
      expect(retrievedVendorList.vendorListVersion).toEqual(27);
      expect(areVendorsSortedById(retrievedVendorList)).toBeTruthy();
      done();
    })
  });

  function areVendorsSortedById(vendorList) {
    let vendorListCopy = JSON.parse(JSON.stringify(vendorList));
    vendorListCopy.vendors = vendorListCopy.vendors.sort((leftVendor, rightVendor) => leftVendor.id - rightVendor.id);
    // the following comparison method is sufficient because order of elements in compared objects is expected to be the same
    return JSON.stringify(vendorList) === JSON.stringify(vendorListCopy);
  }
});
