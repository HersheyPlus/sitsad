import ForgotItemSlider from "@/components/Pages/Home/ForgotItemSlider"
import HomeBanner from "@/components/Pages/Home/HomeBanner"
import HomeFeatures from "@/components/Pages/Home/HomeFeatures"


const HomePage = () => {
  return (
    <>
      <HomeBanner />
      <HomeFeatures />
      <div className="mt-2">
        <ForgotItemSlider />
      </div>
    </>
  )
}

export default HomePage