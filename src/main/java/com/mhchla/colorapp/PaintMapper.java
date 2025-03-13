package com.mhchla.colorapp;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface PaintMapper {

    @Select({
            "<script>",
            "SELECT p.*,",
            "  SQRT(POWER(p.l - #{l},2) + POWER(p.a - #{a},2) + POWER(p.b - #{b},2)) AS deltaE",
            "FROM paint p",
            "<where>",
            "  <if test='manufacturers != null and manufacturers.size() > 0'>",
            "    AND p.manufacturer IN",
            "    <foreach collection='manufacturers' item='m' open='(' separator=',' close=')'>",
            "      #{m}",
            "    </foreach>",
            "  </if>",
            "  <if test='series != null and series.size() > 0'>",
            "    AND p.series IN",
            "    <foreach collection='series' item='s' open='(' separator=',' close=')'>",
            "      #{s}",
            "    </foreach>",
            "  </if>",
            "</where>",
            "ORDER BY deltaE",
            "LIMIT 3",
            "</script>"
    })
    List<Paint> findClosestColors(@Param("l") double l,
                                  @Param("a") double a,
                                  @Param("b") double b,
                                  @Param("manufacturers") List<String> manufacturers,
                                  @Param("series") List<String> series);

    @Select("SELECT DISTINCT manufacturer FROM paint")
    List<String> getManufacturers();

    @Select("SELECT DISTINCT series FROM paint")
    List<String> getSeries();
}
