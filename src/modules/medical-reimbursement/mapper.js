const fallback = {
    fullName: 'Mr. Arulselvan K',
    penNumber: '983628',
    serviceType: 'IFS',
    cadre: 'Chhattisgarh',
    designation: 'Deputy Conservator Of Forests (Snr Scale)',
    grade: 'Senior Scale',
    level: 'Level-11',
    basicPay: 59500,
    officeAddress: 'Aranyabhavan Forest complex, SH Mount, Kottayam, Kerala - 686006',
    residentialAddress: 'Aranyabhavan Forest complex, SH Mount, Kottayam, Kerala - 686006',
    email: 'akhil.ss+73@duk.ac.in',
    mobile: '6282749871',
};
const val = (x, d = '—') => (x === null || x === undefined || x === '' ? d : String(x));
const joinAddr = (...parts) => parts.map((p) => val(p, '')).filter(Boolean).join(', ').replace(/,\s*-\s*/, ' - ');
const normalizeRelationType = (relationType) => {
    if (!relationType)
        return null;
    const key = relationType.toLowerCase();
    if (key.includes('parent'))
        return 'Parent';
    if (key.includes('spouse'))
        return 'Spouse';
    if (key.includes('child'))
        return 'Child';
    return null;
};
export const mapOfficerProfile = (response) => {
    var _a, _b, _c;
    const officerData = ((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.officer_data) || (response === null || response === void 0 ? void 0 : response.officer_data) || {};
    const info = (officerData === null || officerData === void 0 ? void 0 : officerData.ais_officer_info) || {};
    const serviceHistory = (officerData === null || officerData === void 0 ? void 0 : officerData.ais_service_history) || [];
    const family = (officerData === null || officerData === void 0 ? void 0 : officerData.family) || [];
    const activeServices = serviceHistory.filter((item) => (item === null || item === void 0 ? void 0 : item.is_active) === true);
    const sortByRecency = (a, b) => {
        const aTime = new Date((a === null || a === void 0 ? void 0 : a.updated_on) || (a === null || a === void 0 ? void 0 : a.start_date) || 0).getTime();
        const bTime = new Date((b === null || b === void 0 ? void 0 : b.updated_on) || (b === null || b === void 0 ? void 0 : b.start_date) || 0).getTime();
        return bTime - aTime;
    };
    const currentService = (activeServices.length ? [...activeServices].sort(sortByRecency) : [...serviceHistory].sort(sortByRecency))[0] || {};
    const dependents = family
        .map((member) => ({
        personId: val(member === null || member === void 0 ? void 0 : member.person_id, crypto.randomUUID()),
        relation: val(member === null || member === void 0 ? void 0 : member.relation, 'Dependent'),
        relationType: normalizeRelationType(val(member === null || member === void 0 ? void 0 : member.relation_type, '')),
        fullName: `${val(member === null || member === void 0 ? void 0 : member.first_name, '')} ${val(member === null || member === void 0 ? void 0 : member.last_name, '')}`.trim() || 'Dependent Member',
        gender: val(member === null || member === void 0 ? void 0 : member.gender_name, '—'),
        dob: val(member === null || member === void 0 ? void 0 : member.dob, '—'),
        isAlive: Boolean(member === null || member === void 0 ? void 0 : member.is_alive),
    }))
        .filter((d) => d.isAlive && d.relationType);
    return {
        fullName: `${val(info === null || info === void 0 ? void 0 : info.honorifics, '')} ${val(info === null || info === void 0 ? void 0 : info.first_name, '')} ${val(info === null || info === void 0 ? void 0 : info.last_name, '')}`.trim() || fallback.fullName,
        penNumber: val(info === null || info === void 0 ? void 0 : info.pen_number, fallback.penNumber),
        serviceType: val(info === null || info === void 0 ? void 0 : info.service_type_name, fallback.serviceType),
        cadre: val(info === null || info === void 0 ? void 0 : info.cadre, fallback.cadre),
        email: val(info === null || info === void 0 ? void 0 : info.email, fallback.email),
        mobile: val(info === null || info === void 0 ? void 0 : info.mobile_no, fallback.mobile),
        aisNumber: val(info === null || info === void 0 ? void 0 : info.ais_number, 'AIS-10293'),
        dob: val(info === null || info === void 0 ? void 0 : info.dob, '1989-07-20'),
        bloodGroup: val(info === null || info === void 0 ? void 0 : info.blood_group, 'B+'),
        officeAddress: joinAddr(info === null || info === void 0 ? void 0 : info.address_line1_com, info === null || info === void 0 ? void 0 : info.address_line2_com, info === null || info === void 0 ? void 0 : info.district_com, info === null || info === void 0 ? void 0 : info.state_com, `- ${val(info === null || info === void 0 ? void 0 : info.pin_code_com, '')}`) || fallback.officeAddress,
        residentialAddress: joinAddr(info === null || info === void 0 ? void 0 : info.address_line1_per, info === null || info === void 0 ? void 0 : info.address_line2_per, info === null || info === void 0 ? void 0 : info.district_per, info === null || info === void 0 ? void 0 : info.state_per, `- ${val(info === null || info === void 0 ? void 0 : info.pin_code_per, '')}`) || fallback.residentialAddress,
        designation: val(currentService === null || currentService === void 0 ? void 0 : currentService.designation, fallback.designation),
        grade: val((_b = currentService === null || currentService === void 0 ? void 0 : currentService.grade) !== null && _b !== void 0 ? _b : currentService === null || currentService === void 0 ? void 0 : currentService.grade_name, fallback.grade),
        level: val((_c = currentService === null || currentService === void 0 ? void 0 : currentService.level) !== null && _c !== void 0 ? _c : currentService === null || currentService === void 0 ? void 0 : currentService.level_name, fallback.level),
        postingTypes: val(currentService === null || currentService === void 0 ? void 0 : currentService.posting_types, 'Field Posting'),
        administrativeDepartment: val(currentService === null || currentService === void 0 ? void 0 : currentService.administrative_department, 'Forest Department'),
        agency: val(currentService === null || currentService === void 0 ? void 0 : currentService.agency, 'Kerala Forest Force'),
        district: val(currentService === null || currentService === void 0 ? void 0 : currentService.district, 'Kottayam'),
        state: val(currentService === null || currentService === void 0 ? void 0 : currentService.state, 'Kerala'),
        basicPay: Number((currentService === null || currentService === void 0 ? void 0 : currentService.basic_pay) || fallback.basicPay),
        orderNo: val(currentService === null || currentService === void 0 ? void 0 : currentService.order_no, 'GO-1288/2025'),
        startDate: val(currentService === null || currentService === void 0 ? void 0 : currentService.start_date, '2024-06-05'),
        officePostingAddress: val(currentService === null || currentService === void 0 ? void 0 : currentService.address, fallback.officeAddress),
        dependents,
    };
};
