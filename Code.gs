/**
 * Vietnam Administrative Units API - 3 Tier Structure
 * Google Apps Script Web App API for Vietnam's administrative divisions
 */

// Base API client class (same as provided)
class VietnamAdministrativeAPI {
  constructor(baseUrl = "https://danhmuchanhchinh.gso.gov.vn/DMDVHC.asmx") {
    this.baseUrl = baseUrl;
    this.headers = {
      "Content-Type": "text/xml; charset=utf-8"
    };
  }

  _createSoapEnvelope(bodyContent) {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${bodyContent}
  </soap:Body>
</soap:Envelope>`;
  }

  _sendSoapRequest(soapPayload, soapAction) {
    const headers = {
      ...this.headers,
      "SOAPAction": soapAction
    };

    const options = {
      method: "POST",
      headers: headers,
      payload: soapPayload
    };

    try {
      const response = UrlFetchApp.fetch(this.baseUrl, options);
      
      if (response.getResponseCode() !== 200) {
        throw new Error(`HTTP Error: ${response.getResponseCode()}`);
      }

      const responseText = response.getContentText();
      return XmlService.parse(responseText);
    } catch (error) {
      console.error("SOAP Request Error:", error);
      throw error;
    }
  }

  getProvinces(date = "14/07/2025") {
    const bodyContent = `<DanhMucTinh xmlns="http://tempuri.org/">
      <DenNgay>${date}</DenNgay>
    </DanhMucTinh>`;

    const soapPayload = this._createSoapEnvelope(bodyContent);
    const xmlDoc = this._sendSoapRequest(soapPayload, "http://tempuri.org/DanhMucTinh");

    const provinces = [];
    const root = xmlDoc.getRootElement();
    const tables = this._findElementsByName(root, 'TABLE');

    for (let table of tables) {
      const maTinh = this._getElementText(table, 'MaTinh');
      const tenTinh = this._getElementText(table, 'TenTinh');
      const loaiHinh = this._getElementText(table, 'LoaiHinh');

      if (maTinh && tenTinh && loaiHinh) {
        provinces.push({
          MaTinh: maTinh,
          TenTinh: tenTinh,
          LoaiHinh: loaiHinh
        });
      }
    }

    return provinces;
  }

  getDistricts(maTinh, tenTinh, date = "14/07/2025") {
    const bodyContent = `<DanhMucQuanHuyen xmlns="http://tempuri.org/">
      <DenNgay>${date}</DenNgay>
      <Tinh>${maTinh}</Tinh>
      <TenTinh>${tenTinh}</TenTinh>
    </DanhMucQuanHuyen>`;

    const soapPayload = this._createSoapEnvelope(bodyContent);
    const xmlDoc = this._sendSoapRequest(soapPayload, "http://tempuri.org/DanhMucQuanHuyen");

    const districts = [];
    const root = xmlDoc.getRootElement();
    const tables = this._findElementsByName(root, 'TABLE');

    for (let table of tables) {
      const maQuanHuyen = this._getElementText(table, 'MaQuanHuyen');
      const tenQuanHuyen = this._getElementText(table, 'TenQuanHuyen');
      const loaiHinh = this._getElementText(table, 'LoaiHinh');

      if (maQuanHuyen && tenQuanHuyen) {
        districts.push({
          MaTinh: maTinh,
          TenTinh: tenTinh,
          MaQuanHuyen: maQuanHuyen,
          TenQuanHuyen: tenQuanHuyen,
          LoaiHinh: loaiHinh || null
        });
      }
    }

    return districts;
  }

  getWards(maTinh, tenTinh, maQuanHuyen, tenQuanHuyen, date = "14/07/2025") {
    const bodyContent = `<DanhMucPhuongXa xmlns="http://tempuri.org/">
      <DenNgay>${date}</DenNgay>
      <Tinh>${maTinh}</Tinh>
      <TenTinh>${tenTinh}</TenTinh>
      <QuanHuyen>${maQuanHuyen}</QuanHuyen>
      <TenQuanHuyen>${tenQuanHuyen}</TenQuanHuyen>
    </DanhMucPhuongXa>`;

    const soapPayload = this._createSoapEnvelope(bodyContent);
    const xmlDoc = this._sendSoapRequest(soapPayload, "http://tempuri.org/DanhMucPhuongXa");

    const wards = [];
    const root = xmlDoc.getRootElement();
    const tables = this._findElementsByName(root, 'TABLE');

    for (let table of tables) {
      const maPhuongXa = this._getElementText(table, 'MaPhuongXa');
      const tenPhuongXa = this._getElementText(table, 'TenPhuongXa');
      const loaiHinh = this._getElementText(table, 'LoaiHinh');

      if (maPhuongXa && tenPhuongXa) {
        wards.push({
          MaTinh: maTinh,
          TenTinh: tenTinh,
          MaQuanHuyen: maQuanHuyen,
          TenQuanHuyen: tenQuanHuyen,
          MaPhuongXa: maPhuongXa,
          TenPhuongXa: tenPhuongXa,
          LoaiHinh: loaiHinh || null
        });
      }
    }

    return wards;
  }

  _findElementsByName(element, name) {
    const results = [];
    
    if (element.getName() === name) {
      results.push(element);
    }
    
    const children = element.getChildren();
    for (let child of children) {
      results.push(...this._findElementsByName(child, name));
    }
    
    return results;
  }

  _getElementText(parent, childName) {
    const elements = this._findElementsByName(parent, childName);
    return elements.length > 0 ? elements[0].getText() : null;
  }
}

/**
 * Main API handler - entry point for all requests
 */
function doGet(e) {
  try {
    // Get parameters
    const path = e.parameter.path || '';
    const date = e.parameter.date || getCurrentDate();
    const maTinh = e.parameter.matinh || e.parameter.provinceCode;
    const tenTinh = e.parameter.tentinh || e.parameter.provinceName;
    const maQuanHuyen = e.parameter.mahuyen || e.parameter.districtCode;
    const tenQuanHuyen = e.parameter.tenhuyen || e.parameter.districtName;
    const maPhuongXa = e.parameter.maxa || e.parameter.wardCode;
    
    // Initialize API client
    const api = new VietnamAdministrativeAPI();
    
    // Route requests based on path
    switch (path.toLowerCase()) {
      case 'provinces':
      case 'tinh':
        return handleProvincesRequest(api, date, maTinh);
        
      case 'districts':
      case 'huyen':
        return handleDistrictsRequest(api, date, maTinh, tenTinh);
        
      case 'wards':
      case 'xa':
        return handleWardsRequest(api, date, maTinh, tenTinh, maQuanHuyen, tenQuanHuyen);
        
      case 'all':
        return handleAllRequest(api, date);
        
      default:
        return createResponse({
          error: 'Invalid path',
          message: 'Valid paths: provinces, districts, wards, all',
          usage: getUsageInfo()
        }, 400);
    }
    
  } catch (error) {
    console.error('API Error:', error);
    return createResponse({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
}

/**
 * Handle POST requests (same functionality as GET)
 */
function doPost(e) {
  return doGet(e);
}

/**
 * Handle provinces request
 */
function handleProvincesRequest(api, date, maTinh) {
  try {
    const provinces = api.getProvinces(date);
    
    // Filter by province code if provided
    if (maTinh) {
      const filteredProvinces = provinces.filter(p => p.MaTinh === maTinh);
      if (filteredProvinces.length === 0) {
        return createResponse({
          error: 'Province not found',
          message: `No province found with code: ${maTinh}`
        }, 404);
      }
      return createResponse({
        success: true,
        data: filteredProvinces,
        count: filteredProvinces.length,
        date: date
      });
    }
    
    return createResponse({
      success: true,
      data: provinces,
      count: provinces.length,
      date: date
    });
    
  } catch (error) {
    throw new Error(`Failed to fetch provinces: ${error.message}`);
  }
}

/**
 * Handle districts request
 */
function handleDistrictsRequest(api, date, maTinh, tenTinh) {
  try {
    if (!maTinh || !tenTinh) {
      return createResponse({
        error: 'Missing required parameters',
        message: 'Both matinh (province code) and tentinh (province name) are required for districts'
      }, 400);
    }
    
    const districts = api.getDistricts(maTinh, tenTinh, date);
    
    return createResponse({
      success: true,
      data: districts,
      count: districts.length,
      province: {
        maTinh: maTinh,
        tenTinh: tenTinh
      },
      date: date
    });
    
  } catch (error) {
    throw new Error(`Failed to fetch districts: ${error.message}`);
  }
}

/**
 * Handle wards request
 */
function handleWardsRequest(api, date, maTinh, tenTinh, maQuanHuyen, tenQuanHuyen) {
  try {
    if (!maTinh || !tenTinh || !maQuanHuyen || !tenQuanHuyen) {
      return createResponse({
        error: 'Missing required parameters',
        message: 'matinh, tentinh, mahuyen, and tenhuyen are required for wards'
      }, 400);
    }
    
    const wards = api.getWards(maTinh, tenTinh, maQuanHuyen, tenQuanHuyen, date);
    
    return createResponse({
      success: true,
      data: wards,
      count: wards.length,
      province: {
        maTinh: maTinh,
        tenTinh: tenTinh
      },
      district: {
        maQuanHuyen: maQuanHuyen,
        tenQuanHuyen: tenQuanHuyen
      },
      date: date
    });
    
  } catch (error) {
    throw new Error(`Failed to fetch wards: ${error.message}`);
  }
}

/**
 * Handle request for all administrative units
 */
function handleAllRequest(api, date) {
  try {
    console.log("Fetching all administrative units...");
    const provinces = api.getProvinces(date);
    
    const allDistricts = [];
    const allWards = [];
    
    for (let province of provinces) {
      const districts = api.getDistricts(province.MaTinh, province.TenTinh, date);
      allDistricts.push(...districts);
      
      for (let district of districts) {
        const wards = api.getWards(
          district.MaTinh,
          district.TenTinh,
          district.MaQuanHuyen,
          district.TenQuanHuyen,
          date
        );
        allWards.push(...wards);
      }
    }
    
    return createResponse({
      success: true,
      data: {
        provinces: provinces,
        districts: allDistricts,
        wards: allWards
      },
      summary: {
        provincesCount: provinces.length,
        districtsCount: allDistricts.length,
        wardsCount: allWards.length
      },
      date: date
    });
    
  } catch (error) {
    throw new Error(`Failed to fetch all administrative units: ${error.message}`);
  }
}

/**
 * Create standardized API response
 */
function createResponse(data, statusCode = 200) {
  const response = {
    ...data,
    timestamp: new Date().toISOString(),
    statusCode: statusCode
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get current date in DD/MM/YYYY format
 */
function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get API usage information
 */
function getUsageInfo() {
  return {
    endpoints: {
      provinces: {
        path: "provinces",
        method: "GET",
        parameters: {
          date: "Optional. Format: DD/MM/YYYY",
          matinh: "Optional. Filter by province code"
        },
        example: "?path=provinces&date=14/07/2025&matinh=01"
      },
      districts: {
        path: "districts",
        method: "GET",
        parameters: {
          date: "Optional. Format: DD/MM/YYYY",
          matinh: "Required. Province code",
          tentinh: "Required. Province name"
        },
        example: "?path=districts&matinh=01&tentinh=Hà Nội"
      },
      wards: {
        path: "wards",
        method: "GET",
        parameters: {
          date: "Optional. Format: DD/MM/YYYY",
          matinh: "Required. Province code",
          tentinh: "Required. Province name",
          mahuyen: "Required. District code",
          tenhuyen: "Required. District name"
        },
        example: "?path=wards&matinh=01&tentinh=Hà Nội&mahuyen=001&tenhuyen=Quận Ba Đình"
      },
      all: {
        path: "all",
        method: "GET",
        parameters: {
          date: "Optional. Format: DD/MM/YYYY"
        },
        example: "?path=all&date=14/07/2025"
      }
    },
    notes: [
      "All dates should be in DD/MM/YYYY format",
      "If no date is provided, current date will be used",
      "Response format is JSON with success/error status",
      "All text parameters should be URL encoded"
    ]
  };
}

/**
 * Test function - can be used to test the API locally
 */
function testAPI() {
  // Test provinces
  console.log("Testing provinces...");
  const provincesResponse = doGet({
    parameter: {
      path: 'provinces',
      date: '14/07/2025'
    }
  });
  console.log("Provinces response:", provincesResponse.getContent());
  
  // Test districts (example with Hà Nội)
  console.log("\nTesting districts...");
  const districtsResponse = doGet({
    parameter: {
      path: 'districts',
      matinh: '01',
      tentinh: 'Hà Nội',
      date: '14/07/2025'
    }
  });
  console.log("Districts response:", districtsResponse.getContent());
}