import moment from 'moment';

const normalize = (str) => str?.toString().trim().toLowerCase() || '';

export function buildMappedServiceDetails({
  serviceDetails = [],
  dbServices = [],
  designations = [],
  departments = [],
  districts = [],
  states = [],
}) {
  const sparkKeys = new Set();

  const tempServiceList = serviceDetails.map((service, index) => {
    const designationMatch = designations.find((d) => normalize(d.designation) === normalize(service.designation));
    const departmentMatch = departments.find(
      (d) => normalize(d.administrative_department) === normalize(service.department)
    );
    const districtMatch = districts.find((d) => normalize(d.district) === normalize(service.district));
    const stateMatch = states.find((s) => normalize(s.state) === normalize(service.state || 'Kerala'));

    const serviceData = {
      ais_ser_id: `spark_${index}`,
      designation_id: designationMatch ? designationMatch.designation_id : null,
      level_id: null,
      ministry_id: null,
      administrative_department_id: departmentMatch ? departmentMatch.administrative_department_id : null,
      state_id: stateMatch ? stateMatch.state_id : null,
      district_id: districtMatch ? districtMatch.district_id : null,
      start_date: service.date_from ? moment(service.date_from.split(' ')[0], 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
      end_date: service.date_to ? moment(service.date_to.split(' ')[0], 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
      grade_id: null,
      posting_type_id: null,
      address: service.office || ' ',
      phone_no: ' ',
      is_additional_charge: false,
      other_details: service.remarks || ' ',
      basic_pay: service.basic_pay || null,
      order_no: service.order_no || ' ',
      order_date: service.order_date
        ? moment(service.order_date.split(' ')[0], 'DD/MM/YYYY').format('YYYY-MM-DD')
        : null,
      _source: 'SPARK',
      isSaved: false,
      fieldSources: {
        designation_id: designationMatch ? 'SPARK' : 'USER',
        level_id: 'USER',
        ministry_id: 'USER',
        administrative_department_id: departmentMatch ? 'SPARK' : 'USER',
        state_id: stateMatch ? 'SPARK' : 'USER',
        district_id: districtMatch ? 'SPARK' : 'USER',
        start_date: service.date_from ? 'SPARK' : 'USER',
        end_date: service.date_to ? 'SPARK' : 'USER',
        grade_id: 'USER',
        posting_type_id: 'USER',
        address: service.office ? 'SPARK' : 'USER',
        phone_no: 'USER',
        is_additional_charge: 'USER',
        other_details: service.remarks ? 'SPARK' : 'USER',
        basic_pay: service.basic_pay ? 'SPARK' : 'USER',
        order_no: service.order_no ? 'SPARK' : 'USER',
        order_date: service.order_date ? 'SPARK' : 'USER',
      },
    };

    if (service.designation && designationMatch) sparkKeys.add(`designation_id_${index}`);
    if (service.department && departmentMatch) sparkKeys.add(`administrative_department_id_${index}`);
    if (service.district && districtMatch) sparkKeys.add(`district_id_${index}`);
    if (service.state && stateMatch) sparkKeys.add(`state_id_${index}`);
    if (service.date_from) sparkKeys.add(`start_date_${index}`);
    if (service.date_to) sparkKeys.add(`end_date_${index}`);
    if (service.office) sparkKeys.add(`address_${index}`);
    if (service.remarks) sparkKeys.add(`other_details_${index}`);
    if (service.basic_pay) sparkKeys.add(`basic_pay_${index}`);
    if (service.order_no) sparkKeys.add(`order_no_${index}`);
    if (service.order_date) sparkKeys.add(`order_date_${index}`);

    return serviceData;
  });

  const dbServicesList = dbServices.map((dbService) => {
    const fields = dbService.fields || {};
    const merged = {};
    const fieldSourcesLocal = {};

    Object.keys(fields).forEach((sourceKey) => {
      Object.entries(fields[sourceKey] || {}).forEach(([key, value]) => {
        merged[key] = value;
        fieldSourcesLocal[key] = sourceKey === 'DB_SPARK_API' ? 'SPARK' : 'USER';
      });
    });

    const parsedMerged = {
      designation_id: merged.designation_id ? parseInt(merged.designation_id, 10) : null,
      level_id: merged.level_id ? parseInt(merged.level_id, 10) : null,
      ministry_id: merged.ministry_id ? parseInt(merged.ministry_id, 10) : null,
      administrative_department_id: merged.administrative_department_id
        ? parseInt(merged.administrative_department_id, 10)
        : null,
      agency_id: merged.agency_id ? parseInt(merged.agency_id, 10) : null,
      state_id: merged.state_id ? parseInt(merged.state_id, 10) : null,
      district_id: merged.district_id ? parseInt(merged.district_id, 10) : null,
      start_date: merged.start_date || '',
      end_date: merged.end_date || '',
      grade_id: merged.grade_id ? parseInt(merged.grade_id, 10) : null,
      posting_type_id: merged.posting_type_id ? parseInt(merged.posting_type_id, 10) : null,
      address: merged.address || ' ',
      phone_no: merged.phone_no || ' ',
      is_additional_charge: merged.is_additional_charge === 'true' || merged.is_additional_charge === true,
      other_details: merged.other_details || ' ',
      basic_pay: merged.basic_pay ? parseFloat(merged.basic_pay) : null,
      order_no: merged.order_no || ' ',
      order_date: merged.order_date || null,
    };

    const sourcesSet = new Set(Object.values(fieldSourcesLocal));
    const _source = sourcesSet.size > 1 ? 'MIXED' : sourcesSet.has('SPARK') ? 'SPARK' : 'USER';

    return {
      ais_ser_id: String(dbService.ais_ser_id),
      ...parsedMerged,
      _source,
      isSaved: true,
      fieldSources: fieldSourcesLocal,
    };
  });

  const matchedSparkIndices = new Set();
  dbServicesList.forEach((dbService) => {
    const matchedIndex = tempServiceList.findIndex((sparkService) => {
      const sparkDesignation = normalize(
        designations.find((d) => d.designation_id === sparkService.designation_id)?.designation || ''
      );
      const dbDesignation = normalize(
        designations.find((d) => d.designation_id === dbService.designation_id)?.designation || ''
      );
      const sparkDepartment = normalize(
        departments.find((d) => d.administrative_department_id === sparkService.administrative_department_id)
          ?.administrative_department || ''
      );
      const dbDepartment = normalize(
        departments.find((d) => d.administrative_department_id === dbService.administrative_department_id)
          ?.administrative_department || ''
      );
      const sparkStartDate = sparkService.start_date;
      const dbStartDate = dbService.start_date;

      return sparkDesignation === dbDesignation && sparkDepartment === dbDepartment && sparkStartDate === dbStartDate;
    });

    if (matchedIndex !== -1) {
      matchedSparkIndices.add(matchedIndex);
      tempServiceList[matchedIndex].isSaved = true;
      tempServiceList[matchedIndex].ais_ser_id = dbService.ais_ser_id;

      Object.keys(dbService).forEach((key) => {
        if (
          !['ais_ser_id', '_source', 'isSaved', 'fieldSources'].includes(key) &&
          dbService[key] !== null &&
          dbService[key] !== undefined &&
          dbService[key] !== ''
        ) {
          tempServiceList[matchedIndex][key] = dbService[key];
        }
      });

      tempServiceList[matchedIndex].fieldSources = {
        ...tempServiceList[matchedIndex].fieldSources,
        ...dbService.fieldSources,
      };

      const newFieldSources = tempServiceList[matchedIndex].fieldSources;
      const sourcesSet = new Set(Object.values(newFieldSources));
      tempServiceList[matchedIndex]._source =
        sourcesSet.size > 1 ? 'MIXED' : sourcesSet.has('SPARK') ? 'SPARK' : 'USER';
    }
  });

  const details = [
    ...tempServiceList.filter((_, index) => !matchedSparkIndices.has(index)),
    ...tempServiceList.filter((_, index) => matchedSparkIndices.has(index)),
    ...dbServicesList,
  ].reduce((unique, current) => {
    if (!unique.some((item) => String(item.ais_ser_id) === String(current.ais_ser_id))) {
      unique.push(current);
    }
    return unique;
  }, []);

  details.sort((a, b) => moment(b.start_date).valueOf() - moment(a.start_date).valueOf());

  return { details, sparkKeys };
}
