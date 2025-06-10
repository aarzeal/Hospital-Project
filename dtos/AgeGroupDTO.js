exports.toAgeGroupPOST = (dto) => ({
  age_group_name: dto.ageGroupName,
  from_age: dto.fromAge,
  to_age: dto.toAge,
  age_from_type:dto.ageFromType,
  is_active:dto.isActive,
  is_any_age_group:dto.isAnyAgeGroup,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

exports.toAgeGroupEntity = (dto) => ({
  ageGroupId: dto.age_group_id,
  ageGroupName: dto.age_group_name,
  fromAge: dto.from_age,
  toAge: dto.to_age,
  ageFromType: dto.age_from_type,
  isActive:dto.is_active,
  isAnyAgeGroup: dto.is_any_age_group,  
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
});

exports.ageGroupFieldMap={
  ageGroupId: 'age_group_id',
  ageGroupName:'age_group_name',
  fromAge: 'from_age',
  toAge: 'to_age',
  ageFromType: 'age_from_type',
  isActive:'is_active',
  isAnyAgeGroup:'is_any_age_group',  
  hospitalIDR: 'hospital_IDR',
  hospitalGroupIDR: 'hospital_group_IDR',
}