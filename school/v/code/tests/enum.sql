SELECT 
    `column_name`,
    SUBSTRING(COLUMN_TYPE,5),
    `COLUMN_TYPE`,
    `data_type`
 FROM `COLUMNS`
   WHERE TABLE_SCHEMA='general_school'
   AND TABLE_NAME='guardian'