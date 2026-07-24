export interface CategoryInterface {
  categoryuuid: string;
  categoryname: string;
  categorystatus: string;
}

export interface CreateCategoryInterface {
  categoryname: string;
}

export interface ChangeStatusResponseDto {
  categoryuuid: string;
  code: string;
  message: string;
}
