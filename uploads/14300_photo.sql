USE [DHRM_PRD_DB]
GO
/****** Object:  Table [dbo].[plant]    Script Date: 21-10-2022 10:47:33 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[plant](
	[plant_code] [varchar](5) NOT NULL,
	[plant_name] [varchar](30) NOT NULL,
	[del_status] [bit] NOT NULL,
	[pl] [varchar](2) NULL,
	[addr] [varchar](500) NULL,
	[locatn] [varchar](100) NULL,
	[plant_sign] [varchar](20) NULL,
	[personal_area] [int] NULL,
	[payroll_area] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[plant_code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[plant] ADD  DEFAULT ((1)) FOR [del_status]
GO
ALTER TABLE [dbo].[plant] ADD  CONSTRAINT [constraint_name]  DEFAULT (NULL) FOR [pl]
GO
