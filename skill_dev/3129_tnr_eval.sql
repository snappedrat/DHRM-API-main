USE [DHRM_PRD_DB]
GO
/****** Object:  StoredProcedure [dbo].[POST_EVALUATION_LIST_DUE]    Script Date: 01-03-2023 00:36:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER procedure [dbo].[POST_EVALUATION_LIST_DUE] @plant_code varchar(5)
AS
WITH cte AS 
(SELECT apln_slno, COUNT(*) AS record_count FROM post_evaluation GROUP BY apln_slno) 
SELECT t.*,e.Emp_Name, DATEDIFF(day, TRY_PARSE(t.doj AS DATE USING 'en-US'), GETDATE()) as diff,
cte.record_count,
d.dept_name, l.line_name FROM trainee_apln t 
INNER JOIN cte ON t.apln_slno = cte.apln_slno 
JOIN department d on t.dept_slno = d.dept_slno 
join mst_line l on t.line_code = l.line_code
JOIN employees e on t.reporting_to = e.empl_slno
and apln_status = 'APPOINTED' 
AND t.apln_slno IN (SELECT distinct apln_slno FROM post_evaluation WHERE ra_entry = 'Y' and HR_Entry = 'Y')
where t.plant_code = @plant_code

