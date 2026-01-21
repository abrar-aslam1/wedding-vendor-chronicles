import { MainNav } from "@/components/MainNav";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import PlanBoard from "@/components/portal/PlanBoard";
import WeddingTimeline from "@/components/portal/WeddingTimeline";

// Mock data for demonstration
const mockFavorites = [
  {
    id: "1",
    title: "Elegant Events Venue",
    description: "A beautiful venue for your special day",
    rating: { value: 4.8, count: 120 },
    address: "123 Wedding Lane, New York, NY",
    main_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1498&q=80",
  },
  {
    id: "2",
    title: "Delicious Catering Co.",
    description: "Exquisite food for your wedding reception",
    rating: { value: 4.6, count: 85 },
    address: "456 Culinary Blvd, New York, NY",
    main_image: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "3",
    title: "Floral Fantasy",
    description: "Beautiful floral arrangements for your wedding",
    rating: { value: 4.9, count: 95 },
    address: "789 Petal Street, New York, NY",
    main_image: "https://images.unsplash.com/photo-1561128290-014e6b5a3d38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
];

const DemoPortal = () => {
  const [activeTab, setActiveTab] = useState("favorites");

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-wedding-primary mb-8">My Wedding Portal (Demo)</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex justify-between mb-8 bg-gray-100">
            <TabsTrigger 
              value="favorites" 
              className="flex-1 data-[state=active]:bg-wedding-primary data-[state=active]:text-white"
            >
              My Favorites
            </TabsTrigger>
            <TabsTrigger 
              value="planboard" 
              className="flex-1 data-[state=active]:bg-wedding-primary data-[state=active]:text-white"
            >
              Plan Board
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="flex-1 data-[state=active]:bg-wedding-primary data-[state=active]:text-white"
            >
              Wedding Timeline
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFavorites.map((favorite) => (
                <div key={favorite.id} className="relative flex w-full flex-col rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg">
                  <div className="relative mx-4 -mt-6 h-48 overflow-hidden rounded-xl shadow-lg">
                    <img
                      src={favorite.main_image}
                      alt={favorite.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-wedding-text line-clamp-2 mb-2">
                      {favorite.title}
                    </h3>
                    {favorite.rating && (
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(favorite.rating.value)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 15.934l-6.18 3.254 1.18-6.875L.11 7.695l6.9-1.004L10 .5l3.09 6.19 6.9 1.005-4.89 4.618 1.18 6.875L10 15.934z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          ({favorite.rating.count} reviews)
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {favorite.description}
                    </p>
                    <div className="text-sm text-gray-600">
                      <p>{favorite.address}</p>
                    </div>
                  </div>
                  <div className="px-6 pb-3">
                    <button className="flex w-full items-center justify-center gap-3.5 px-4 py-2.5 rounded-lg cursor-pointer select-none bg-white shadow-[rgba(149,157,165,0.2)_0px_8px_24px] text-wedding-text hover:bg-gray-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 fill-wedding-primary stroke-wedding-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      <div className="relative overflow-hidden grid">
                        <span className="translate-y-[-100%] opacity-0">
                          Add to Favorites
                        </span>
                        <span className="translate-y-0 opacity-100">
                          Added to Favorites
                        </span>
                      </div>
                    </button>
                  </div>
                  <div className="p-6 pt-0 mt-auto">
                    <button className="group relative inline-block w-full cursor-pointer outline-none border-0 bg-transparent p-0 text-base font-inherit">
                      <span className="absolute top-0 left-0 h-12 w-12 rounded-full bg-wedding-primary transition-all duration-450 ease-out group-hover:w-full group-hover:shadow-lg group-active:scale-95">
                        <span className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-0.5">
                          <span className="absolute right-0.5 -top-1 h-2.5 w-2.5 rotate-45 border-t-2 border-r-2 border-white"></span>
                        </span>
                      </span>
                      <span className="relative block py-3 px-0 text-center font-bold uppercase tracking-wider text-wedding-text/50 transition-all duration-450 ease-out group-hover:translate-x-0 group-hover:text-white">
                        View Details
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="planboard">
            <PlanBoard isDemo={true} />
          </TabsContent>
          
          <TabsContent value="timeline">
            <WeddingTimeline />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DemoPortal;
