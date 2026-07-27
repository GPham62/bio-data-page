// Project 5 — Hanoi delivery ratings
//
// Every figure here comes from one run of project5_analysis.ipynb over one
// snapshot of ShopeeFood's Hanoi listing, collected 2026-07-25. The raw
// snapshot is not in this repo and never will be: only these aggregates are
// published. Re-running the notebook is the only way to change these numbers,
// and project5.test.js fails if one is edited without the series behind it.
//
// Scope, stated because it changes what the figures mean: this is the promoted,
// deliverable-to-one-address slice of the listing, not all of Hanoi. Reviews are
// 2018-2021 and cover 115 of the 402 restaurants.

export const stats = {
  restaurants: 402,
  analysable: 337,
  reviews: 691,
  reviewedRestaurants: 115,
  pairedRestaurants: 113,
  restaurantsWithComplaint: 65,
  ratingMedian: 4.60,
  ratingP25: 4.40,
  ratingP75: 4.70,
  shareAbove45: 0.671,
  correlation: 0.084,
  priceSpread: 9.2,
  ratingSpread: 0.30,
  labelAccuracy: 0.967,
}

export const ratingHistogram = [{"rating": 2.0, "count": 1}, {"rating": 2.7, "count": 1}, {"rating": 3.0, "count": 4}, {"rating": 3.2, "count": 1}, {"rating": 3.3, "count": 1}, {"rating": 3.4, "count": 1}, {"rating": 3.5, "count": 1}, {"rating": 3.6, "count": 1}, {"rating": 3.7, "count": 6}, {"rating": 3.8, "count": 2}, {"rating": 3.9, "count": 3}, {"rating": 4.0, "count": 7}, {"rating": 4.1, "count": 8}, {"rating": 4.2, "count": 12}, {"rating": 4.3, "count": 29}, {"rating": 4.4, "count": 33}, {"rating": 4.5, "count": 46}, {"rating": 4.6, "count": 44}, {"rating": 4.7, "count": 53}, {"rating": 4.8, "count": 42}, {"rating": 4.9, "count": 19}, {"rating": 5.0, "count": 22}]

export const byCategory = [{"category": "Ăn vặt/vỉa hè", "n": 29, "medianPrice": 30000, "medianRating": 4.7}, {"category": "Café/Dessert", "n": 52, "medianPrice": 45000, "medianRating": 4.7}, {"category": "Quán ăn", "n": 198, "medianPrice": 60000, "medianRating": 4.5}, {"category": "Shop Online", "n": 43, "medianPrice": 70000, "medianRating": 4.6}, {"category": "Nhà hàng", "n": 10, "medianPrice": 275000, "medianRating": 4.4}]

export const ratingPairs = [{"sf": 4.7, "foody": 7.26, "n": 7}, {"sf": 4.6, "foody": 8.0, "n": 1}, {"sf": 4.4, "foody": 9.47, "n": 6}, {"sf": 4.9, "foody": 10.0, "n": 1}, {"sf": 4.5, "foody": 9.8, "n": 1}, {"sf": 4.6, "foody": 6.4, "n": 1}, {"sf": 4.8, "foody": 7.73, "n": 3}, {"sf": 4.7, "foody": 6.8, "n": 1}, {"sf": 5.0, "foody": 4.2, "n": 1}, {"sf": 4.3, "foody": 7.07, "n": 3}, {"sf": 4.7, "foody": 8.88, "n": 10}, {"sf": 4.0, "foody": 9.06, "n": 10}, {"sf": 4.8, "foody": 4.2, "n": 1}, {"sf": 4.7, "foody": 7.0, "n": 1}, {"sf": 4.7, "foody": 7.85, "n": 8}, {"sf": 3.9, "foody": 8.6, "n": 1}, {"sf": 4.3, "foody": 8.4, "n": 9}, {"sf": 4.6, "foody": 6.4, "n": 1}, {"sf": 4.6, "foody": 6.0, "n": 3}, {"sf": 4.6, "foody": 1.0, "n": 1}, {"sf": 4.0, "foody": 7.4, "n": 1}, {"sf": 4.7, "foody": 8.8, "n": 1}, {"sf": 4.5, "foody": 2.6, "n": 1}, {"sf": 4.5, "foody": 7.0, "n": 1}, {"sf": 4.2, "foody": 3.6, "n": 2}, {"sf": 4.5, "foody": 9.27, "n": 3}, {"sf": 4.3, "foody": 3.4, "n": 1}, {"sf": 4.5, "foody": 8.6, "n": 2}, {"sf": 4.2, "foody": 9.13, "n": 3}, {"sf": 4.0, "foody": 10.0, "n": 3}, {"sf": 4.5, "foody": 1.0, "n": 1}, {"sf": 4.4, "foody": 6.18, "n": 10}, {"sf": 4.8, "foody": 9.72, "n": 5}, {"sf": 4.8, "foody": 8.1, "n": 2}, {"sf": 4.0, "foody": 10.0, "n": 1}, {"sf": 3.0, "foody": 1.0, "n": 1}, {"sf": 3.7, "foody": 9.8, "n": 10}, {"sf": 4.8, "foody": 1.0, "n": 1}, {"sf": 3.2, "foody": 5.0, "n": 1}, {"sf": 4.7, "foody": 3.4, "n": 1}, {"sf": 4.4, "foody": 5.02, "n": 10}, {"sf": 4.0, "foody": 6.8, "n": 2}, {"sf": 4.6, "foody": 7.62, "n": 8}, {"sf": 4.7, "foody": 7.26, "n": 10}, {"sf": 4.8, "foody": 7.04, "n": 10}, {"sf": 3.8, "foody": 7.0, "n": 1}, {"sf": 4.5, "foody": 7.32, "n": 5}, {"sf": 4.7, "foody": 5.5, "n": 6}, {"sf": 4.5, "foody": 7.4, "n": 1}, {"sf": 4.9, "foody": 7.87, "n": 3}, {"sf": 4.5, "foody": 5.53, "n": 9}, {"sf": 4.8, "foody": 7.31, "n": 7}, {"sf": 4.4, "foody": 8.16, "n": 5}, {"sf": 4.8, "foody": 7.12, "n": 10}, {"sf": 4.6, "foody": 7.62, "n": 10}, {"sf": 4.4, "foody": 3.85, "n": 4}, {"sf": 4.6, "foody": 5.04, "n": 10}, {"sf": 4.6, "foody": 7.44, "n": 9}, {"sf": 4.4, "foody": 4.9, "n": 10}, {"sf": 4.7, "foody": 8.4, "n": 1}, {"sf": 4.6, "foody": 7.0, "n": 10}, {"sf": 4.7, "foody": 6.6, "n": 10}, {"sf": 4.4, "foody": 6.9, "n": 10}, {"sf": 4.8, "foody": 5.9, "n": 10}, {"sf": 4.8, "foody": 8.02, "n": 10}, {"sf": 4.3, "foody": 7.14, "n": 10}, {"sf": 4.7, "foody": 6.28, "n": 10}, {"sf": 4.1, "foody": 7.72, "n": 5}, {"sf": 4.7, "foody": 6.9, "n": 10}, {"sf": 4.5, "foody": 5.83, "n": 6}, {"sf": 4.7, "foody": 6.38, "n": 10}, {"sf": 3.0, "foody": 4.9, "n": 10}, {"sf": 4.6, "foody": 6.85, "n": 4}, {"sf": 4.6, "foody": 7.6, "n": 10}, {"sf": 4.4, "foody": 7.7, "n": 10}, {"sf": 4.4, "foody": 7.23, "n": 7}, {"sf": 3.5, "foody": 9.5, "n": 10}, {"sf": 4.5, "foody": 8.2, "n": 10}, {"sf": 4.5, "foody": 7.92, "n": 10}, {"sf": 4.8, "foody": 8.36, "n": 5}, {"sf": 4.5, "foody": 4.8, "n": 7}, {"sf": 4.7, "foody": 7.82, "n": 10}, {"sf": 4.4, "foody": 7.74, "n": 10}, {"sf": 4.7, "foody": 6.24, "n": 10}, {"sf": 4.3, "foody": 7.86, "n": 10}, {"sf": 4.7, "foody": 7.3, "n": 10}, {"sf": 4.6, "foody": 5.4, "n": 10}, {"sf": 4.5, "foody": 6.28, "n": 10}, {"sf": 5.0, "foody": 10.0, "n": 1}, {"sf": 4.3, "foody": 6.82, "n": 9}, {"sf": 4.4, "foody": 6.12, "n": 10}, {"sf": 4.3, "foody": 5.26, "n": 10}, {"sf": 4.4, "foody": 7.2, "n": 1}, {"sf": 4.5, "foody": 7.92, "n": 8}, {"sf": 4.3, "foody": 4.22, "n": 10}, {"sf": 4.8, "foody": 7.38, "n": 10}, {"sf": 4.8, "foody": 6.97, "n": 7}, {"sf": 4.7, "foody": 7.58, "n": 10}, {"sf": 4.5, "foody": 6.6, "n": 5}, {"sf": 4.7, "foody": 7.6, "n": 10}, {"sf": 5.0, "foody": 6.48, "n": 10}, {"sf": 4.6, "foody": 7.88, "n": 10}, {"sf": 4.1, "foody": 8.0, "n": 1}, {"sf": 4.5, "foody": 6.68, "n": 10}, {"sf": 4.4, "foody": 5.84, "n": 10}, {"sf": 4.6, "foody": 4.4, "n": 1}, {"sf": 4.7, "foody": 7.02, "n": 10}, {"sf": 4.6, "foody": 5.65, "n": 4}, {"sf": 5.0, "foody": 8.6, "n": 1}, {"sf": 4.7, "foody": 6.13, "n": 6}, {"sf": 4.6, "foody": 6.27, "n": 9}, {"sf": 4.7, "foody": 7.0, "n": 1}, {"sf": 4.7, "foody": 7.62, "n": 10}]

export const complaints = [{"category": "taste", "n": 229, "share": 0.331, "drag": 2.035}, {"category": "value", "n": 114, "share": 0.165, "drag": 1.622}, {"category": "service", "n": 44, "share": 0.064, "drag": 2.68}, {"category": "ordering", "n": 41, "share": 0.059, "drag": 2.183}, {"category": "wait", "n": 37, "share": 0.054, "drag": 0.986}, {"category": "delivery", "n": 37, "share": 0.054, "drag": 2.768}, {"category": "cleanliness", "n": 31, "share": 0.045, "drag": 2.94}]

export const complaintReach = [{"category": "taste", "nRestaurants": 39, "drag": 2.035, "nReviews": 229}, {"category": "value", "nRestaurants": 8, "drag": 1.622, "nReviews": 114}, {"category": "delivery", "nRestaurants": 5, "drag": 2.768, "nReviews": 37}, {"category": "service", "nRestaurants": 5, "drag": 2.68, "nReviews": 44}, {"category": "ordering", "nRestaurants": 4, "drag": 2.183, "nReviews": 41}, {"category": "cleanliness", "nRestaurants": 3, "drag": 2.94, "nReviews": 31}, {"category": "wait", "nRestaurants": 1, "drag": 0.986, "nReviews": 37}]

export const districts = [{"district": "Đống Đa", "n": 100}, {"district": "Hai Bà Trưng", "n": 91}, {"district": "Ba Đình", "n": 67}, {"district": "Hoàn Kiếm", "n": 44}, {"district": "Cầu Giấy", "n": 42}, {"district": "Thanh Xuân", "n": 33}, {"district": "Hoàng Mai", "n": 24}, {"district": "Long Biên", "n": 1}]

export const collectorUrl = 'https://github.com/GPham62/ShopeeFoodCollector'
export const notebookUrl  = 'https://github.com/GPham62/bio-data-page/blob/main/project5_analysis.ipynb'
