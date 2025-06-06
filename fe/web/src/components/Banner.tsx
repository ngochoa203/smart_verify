import Slider from "react-slick";

// Import ảnh từ assets
import banner1 from "@/assets/images/banner1.jpg";
import banner2 from "@/assets/images/banner2.jpg";
import banner3 from "@/assets/images/banner3.jpg";
import banner4 from "@/assets/images/banner4.jpg";
import banner5 from "@/assets/images/banner5.jpg";

const banners = [
  { src: banner1, alt: "Banner 1", link: "/collections/all" },
  { src: banner2, alt: "Banner 2", link: "/collections/all" },
  { src: banner3, alt: "Banner 3", link: "/collections/all" },
  { src: banner4, alt: "Banner 4", link: "/collections/all" },
  { src: banner5, alt: "Banner 5", link: "/collections/all" },
];

// Import CSS cho react-slick, thường import một lần ở entry point, hoặc trong component
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

export default function Banner() {
  const settings = {
    dots: true,
    infinite: true,  
    speed: 500,           
    slidesToShow: 1,       
    slidesToScroll: 1,
    arrows: true,           
    autoplay: true,         
    autoplaySpeed: 3000,
  };

  return (
    <div className="section_slider">
      <Slider {...settings}>
        {banners.map(({ src, alt, link }, index) => (
          <div key={index}>
            <a href={link} className="clearfix" title={alt}>
              <img
                src={src}
                alt={alt}
                className="w-full h-[800px] aspect-[16/4] object-cover duration-300"
              />
            </a>
          </div>
        ))}
      </Slider>
    </div>
  );
}
