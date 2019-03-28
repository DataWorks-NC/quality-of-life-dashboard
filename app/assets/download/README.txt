DURHAM NEIGHBORHOOD COMPASS DATA DOWNLOAD
This readme file describes the content of the data download of the Compass as of March 15, 2019. 


The Neighborhood Compass (https://compass.durhamnc.gov) is a publicly-accessible neighborhood data portal for residents of Durham city and county. It serves more than 60 variables related to community health, housing, transportation and demographics. It is maintained and developed by DataWorks NC and hosted by the City of Durham.


CONTENTS OF THE DOWNLOAD
GEOGRAPHY FILES
Blockgroups - Blockgroup geography shapefiles as found in the Census TIGER  dataset
Census tracts - Census tract geography shapefiles as found in the CENSUS TIGER dataset


DATA TABLES
The data tables contain numerators, denominators and margins of error for each variable found in the Compass. Each variable (numerator, denominator, calculated metric or margin of error) is found in a separate CSV file. The fields in each file will look like this:


id: the Census FIPS or GEOID for each blockgroup or Census tract
y_2017: the numerator or denominator value for the table’s variable (say, median household income) in that year. So the 2017 value will be “y_ 2017”, 2015 would be “y_2015”, etc. Not all metrics have multiple years. 


Table naming convention should be interpreted like this:  
        Numerators - rNAME
        Denominators - dNAME
        Margins of Error - mNAME-accuracy
        Raw numbers, for metrics aggregated using an average - mNAME
        Raw numbers, for metrics aggregated using a sum, like population - nNAME


The “n” and “m” tables can be used as is. For metrics with “r” and “d” tables, to calculate the finished metrics as seen on the Neighborhood Compass, join like-named numerator and denominator tables by the “id” column. This is the Census FIPS code, aka GEOID. 


All variables that are normalized by area will have a decimal area value for each year in the denominator file. This is the area of the blockgroup or tract in square miles. 


DATA DICTIONARY TABLE
This Excel file references each variable in the Compass, its abbreviated name in the application (for example MEDINC = median household income), a brief description of the variable, and its source.


In March and April 2019, DataWorks is redesigning the Compass data download, making substantial improvements for accessibility and ease of use. If you have comments or questions please don’t hesitate to contact us at tech@dataworks-nc.org.