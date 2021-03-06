/* global kakao */
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dotenv from 'dotenv';

import ServantInfoAddressForm from '../../components/auth/SignUp/ServantInfo/ServantInfoAddressForm';
import {
  REGION_CODE_REQUEST,
  CURRENT_GPS_REQUEST,
  CURRENT_GPS_SUCCESS,
  CURRENT_GPS_FAILURE,
} from '../../modules/map';
import { SIGN_UP_8, PREV_PAGE } from '../../modules/auth';

dotenv.config();

const ServantInfoAddressFormContainer = () => {
  const [myMap, setMyMap] = useState(null);

  const { regionCodeData, currentLocation, currentGPSLoading, currentGPSDone } = useSelector(
    (state) => state.map,
  );
  const { geoLat, geoLon } = currentLocation;
  const dispatch = useDispatch();

  /* 지도 생성 */
  useEffect(() => {
    const script = document.createElement('script');
    if (myMap === null) {
      console.log('1. 지도 생성');
      script.type = 'text/javascript';
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_APP_KEY}&libraries=services&autoload=false`;
      document.head.appendChild(script);

      script.onload = () => {
        kakao.maps.load(() => {
          const mapContainer = document.getElementById('map'); // 지도를 표시할 div
          const options = {
            center: new kakao.maps.LatLng(33.450701, 126.570667),
            level: 6,
          };

          const map = new kakao.maps.Map(mapContainer, options);

          setMyMap(map);
        });
      };
    }
    return () => {
      document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 현재 위치 가져오기 */
  useEffect(() => {
    if (navigator.geolocation) {
      dispatch({
        type: CURRENT_GPS_REQUEST,
      });
      // GPS를 지원하면
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude } = position.coords;
          const { longitude } = position.coords;
          console.log('2. GPS 가져오기');
          dispatch({
            type: CURRENT_GPS_SUCCESS,
            data: {
              geoLat: latitude,
              geoLon: longitude,
            },
          });
        },
        (error) => {
          console.error(error);
          dispatch({
            type: CURRENT_GPS_FAILURE,
            error,
          });
        },
        {
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: Infinity,
        },
      );
    } else {
      alert('GPS를 지원하지 않습니다');
    }
  }, [dispatch]);

  useEffect(() => {
    if (myMap !== null && geoLat && geoLon) {
      console.log('3. 마커 등록');

      // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
      const locPosition = new kakao.maps.LatLng(geoLat, geoLon);

      // 마커와 인포윈도우를 표시합니다
      const imageSrc = '/images/map/maker.svg'; // 마커이미지의 주소입니다
      const imageSize = new kakao.maps.Size(30, 40); // 마커이미지의 크기입니다
      const imageOption = { offset: new kakao.maps.Point(10, 30) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.

      // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
      const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

      // 마커를 생성합니다
      const marker = new kakao.maps.Marker({
        map: myMap,
        image: markerImage, // 마커이미지 설정
        position: locPosition,
      });
      marker.setMap(myMap);

      // 지도 중심을 부드럽게 이동시킵니다
      // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
      myMap.panTo(locPosition);
    }
  }, [geoLat, geoLon, myMap]);

  /* 행정동 찾기 */
  useEffect(() => {
    if (currentGPSDone) {
      console.log('4. 행정동 찾기');
      console.log(geoLat, geoLon);
      dispatch({
        type: REGION_CODE_REQUEST,
        data: {
          x: geoLon,
          y: geoLat,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGPSDone]);

  /* 페이지 8 - 행정동 입력 */
  const onSubmitSignUp = useCallback(() => {
    dispatch({
      type: SIGN_UP_8,
      data: regionCodeData,
    });
    return dispatch({
      type: PREV_PAGE,
    });
  }, [dispatch, regionCodeData]);

  return (
    <ServantInfoAddressForm
      regionCodeData={regionCodeData}
      currentGPSLoading={currentGPSLoading}
      onSubmitSignUp={onSubmitSignUp}
    />
  );
};

export default ServantInfoAddressFormContainer;
