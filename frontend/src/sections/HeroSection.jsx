import { Button } from "@/components/ui/button"

function HeroSection() {
  return (
    <section className="w-full py-12">
      <div className="circlePosition w-full h-full bg-[#36a0d142] rounded-[100%] absolute -z-10 blur-[100px] flex justify-center items-center">
        <div className="circle w-68 h-68 bg-[#26b9fd42] rounded-[100%]" />
      </div>
      <div className="container px-4 md:px-6 ">
        <div className="gap-4 grid grid-cols-1 lg:grid-cols-2 md:gap-16 flex items-center">
          <div>
            <h1 className="text-6xl font-extrabold mb-4">
              Revolutionizing Repair Services with Ease
            </h1>
            <p className="py-4 mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Empower individuals and technicians with a seamless platform to book, track, and manage repair services. 
              With an intuitive interface and trusted professionals, we make the repair process simple, transparent, and efficient. 
              Join us in transforming the way repairs are done—bringing you closer to the service you need, with just a click.
            </p>

            <div className="flex items-left gap-6">
              <Button variant="outline">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
          
          <img
            alt="heroimage"
            className="mx-auto"
            height="500"
            width="1200"
            src="assets/heropic.png"
          />
        </div>
      </div>
    </section>
  )
}

export default HeroSection;
