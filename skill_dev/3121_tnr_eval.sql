USE [DHRM_PRD_DB]
GO
/****** Object:  StoredProcedure [dbo].[FILEDROP]    Script Date: 06-04-2023 09:32:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[FILEDROP] @apln_slno varchar(20)
AS
BEGIN
	SET NOCOUNT ON;

	select 
	 apln_slno 
,REPLACE(convert(varchar(10),cast(doj as date),105),'-','') doj 
,'02' as reason 
, 'NEW' plans 
, p.personal_area 
, d.sap_code as pers_subarea 
, '1' emp_group 
, a.plant_code 
, c.emp_subgroup
, '01' work_contract 
,  p.payroll_area 
, last_name 
, fullname
,first_name
,case title when 'Mr.' then '1' when 'Ms.' then '2' when 'Mrs.' then '3' end title
, case gender
when 'Male' then '1'
when 'Female' then '2'
when '1' then '1'
when '1' then '2'

end gender
, REPLACE(convert(varchar(10),cast(birthdate as date),105), '-', '') dob
, upper(substring(nationality,1,2)) nationality1 
, case state_name
when 'Andra Pradesh'	then	'01'
when 'Arunachal Pradesh'	then	'02'
when 'Assam'	then	'03'
when 'Bihar'	then	'04'
when 'Goa'	then	'05'
when 'Gujarat'	then	'06'
when 'Haryana'	then	'07'
when 'Himachal Pradesh'	then	'08'
when 'Jammu und Kashmir'	then	'09'
when 'Karnataka'	then	'10'
when 'Kerala'	then	'11'
when 'Madhya Pradesh'	then	'12'
when 'Maharashtra'	then	'13'
when 'Manipur'	then	'14'
when 'Megalaya'	then	'15'
when 'Mizoram'	then	'16'
when 'Nagaland'	then	'17'
when 'Orissa'	then	'18'
when 'Punjab'	then	'19'
when 'Rajasthan'	then	'20'
when 'Sikkim'	then	'21'
when 'Tamil Nadu'	then	'22'
when 'Tripura'	then	'23'
when 'Uttar Pradesh'	then	'24'
when 'West Bengal'	then	'25'
when 'Andaman und Nico.In.'	then	'26'
when 'Chandigarh'	then	'27'
when 'Dadra und Nagar Hav.'	then	'28'
when 'Daman und Diu'	then	'29'
when 'Delhi'	then	'30'
when 'Lakshadweep'	then	'31'
when 'Pondicherry'	then	'32'
when 'Chattisgarh'	then	'33'
when 'Uttrakhand'	then	'34'
when 'Jharkhand'	then	'35'
when 'Telangana'	then	'36' end st
, birth_place 
, upper(substring(nationality,1,2)) nationality2 
, religion_sl 
, case marital_status when 'married' then 1 when 'unmarried' then 0 when 'widower' then 2 end marital_status
, case lang1_name
when 'Tamil' then '103'
when 'English' then '100'
when 'Hindi' then '101'
when 'Kannada' then '102' end lang1
, case lang1_read when 1 then 'X' when 0 then ''  when null then '' end lang1_read
, case lang1_write when 1 then 'X' when 0 then '' when null then '' end lang1_write
, case lang1_speak when 1 then 'X' when 0 then '' when null then '' end lang1_speak
, case lang1_understand when 1 then 'X' when 0 then '' when null then '' end lang1_under
, case lang2_name
when 'Tamil' then '103'
when 'English' then '100'
when 'Hindi' then '101'
when 'Kannada' then '102' end lang2
, case lang2_read when 1 then 'X' when 0 then '' when null then '' end lang2_read
, case lang2_write when 1 then 'X' when 0 then '' when null then '' end lang2_write
, case lang2_speak when 1 then 'X' when 0 then '' when null then '' end lang2_speak
, case lang2_understand when 1 then 'X' when 0 then '' when null then '' end lang2_under
, case lang3_name
when 'Tamil' then '103'
when 'English' then '100'
when 'Hindi' then '101'
when 'Kannada' then '102' end lang3
, case lang3_read when 1 then 'X' when 0 then '' when null then '' end lang3_read
, case lang3_write when 1 then 'X' when 0 then '' when null then '' end lang3_write
, case lang3_speak when 1 then 'X' when 0 then '' when null then '' end lang3_speak
, case lang3_understand when 1 then 'X' when 0 then '' when null then '' end lang3_under
, case lang4_name
when 'Tamil' then '103'
when 'English' then '100'
when 'Hindi' then '101'
when 'Kannada' then '102' end lang4 
, case lang5_read when 1 then 'X' when 0 then '' when null then '' end lang4_read
, case lang5_write when 1 then 'X' when 0 then '' when null then '' end lang4_write
, case lang5_speak when 1 then 'X' when 0 then '' when null then '' end lang4_speak
, case lang5_understand when 1 then 'X' when 0 then '' when null then '' end lang4_under
,'' ident_mark1 
,'' ident_mark2
, aadhar_no 
, biometric_no
,fathername
from trainee_apln a
inner join department d on a.dept_slno=d.dept_slno 
inner join plant p on a.plant_code = p.plant_code
inner join category c on a.apprentice_type = c.categorynm
where a.apln_slno = @apln_slno



END
