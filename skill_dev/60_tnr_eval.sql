USE [DHRM_PRD_DB]
GO
/****** Object:  Table [dbo].[master_company]    Script Date: 28-10-2022 09:34:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[master_company](
	[sno] [int] IDENTITY(1,1) NOT NULL,
	[company_code] [varchar](50) NOT NULL,
	[company_name] [varchar](50) NULL,
	[status] [varchar](50) NULL,
	[created_on] [date] NULL,
	[created_by] [varchar](50) NULL,
	[modified_on] [date] NULL,
	[modified_by] [varchar](50) NULL,
	[del_status] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[company_code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[master_company] ON 
GO
INSERT [dbo].[master_company] ([sno], [company_code], [company_name], [status], [created_on], [created_by], [modified_on], [modified_by], [del_status]) VALUES (1, N'1000', N'RANE MADRAS LIMITED', N' ', CAST(N'2022-09-07' AS Date), N'admin', CAST(N'2022-10-26' AS Date), N'2344', 0)
GO
INSERT [dbo].[master_company] ([sno], [company_code], [company_name], [status], [created_on], [created_by], [modified_on], [modified_by], [del_status]) VALUES (2, N'2000', N'RANE ENGINE VALVES', N'Active', CAST(N'2022-09-07' AS Date), N'admin', CAST(N'2022-10-26' AS Date), N'2344', 0)
GO
INSERT [dbo].[master_company] ([sno], [company_code], [company_name], [status], [created_on], [created_by], [modified_on], [modified_by], [del_status]) VALUES (3, N'3000', N'RANE BREAK LINING', N'Active', CAST(N'2022-10-26' AS Date), N'2344', CAST(N'2022-10-26' AS Date), N'2344', 0)
GO
INSERT [dbo].[master_company] ([sno], [company_code], [company_name], [status], [created_on], [created_by], [modified_on], [modified_by], [del_status]) VALUES (4, N'4000', N'ZF RANE', N'Active', CAST(N'2022-10-26' AS Date), N'2344', CAST(N'2022-10-26' AS Date), N'2344', 0)
GO
SET IDENTITY_INSERT [dbo].[master_company] OFF
GO

