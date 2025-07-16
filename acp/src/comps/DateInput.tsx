import { DatePicker } from "@ark-ui/solid/date-picker";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-solid";
import { Index, Portal, Show } from "solid-js/web";
import { Button } from "./Button";
import styles from "./DateInput.module.css";

interface DateInputProps {
	value?: Date;
	onChange?: (value?: Date) => void;
	label?: string;
}

export function DateInput(props: DateInputProps) {
	return (
		<DatePicker.Root value={props.value} onChange={props.onChange}>
			<Show when={props.label}>
				<DatePicker.Label>Publish Date</DatePicker.Label>
			</Show>

			<DatePicker.Control class={styles.control}>
				<DatePicker.Input />
				<DatePicker.ClearTrigger
					asChild={(props) => <Button variant="ghost" {...props()} />}
				>
					<X size={16} />
				</DatePicker.ClearTrigger>
				<DatePicker.Trigger
					asChild={(props) => <Button variant="ghost" {...props()} />}
				>
					<Calendar size={16} />
				</DatePicker.Trigger>
			</DatePicker.Control>

			<Portal>
				<DatePicker.Positioner>
					<DatePicker.Content>
						<DatePicker.View view="day" class={styles.view}>
							<DatePicker.Context>
								{(context) => (
									<>
										<ViewControll />

										<DatePicker.Table>
											<DatePicker.TableHead>
												<DatePicker.TableRow>
													<Index each={context().weekDays}>
														{(weekDay) => (
															<DatePicker.TableHeader
																class={styles.tableHeader}
															>
																{weekDay().narrow}
															</DatePicker.TableHeader>
														)}
													</Index>
												</DatePicker.TableRow>
											</DatePicker.TableHead>

											<DatePicker.TableBody>
												<Index each={context().weeks}>
													{(week) => (
														<DatePicker.TableRow>
															<Index each={week()}>
																{(day) => (
																	<DatePicker.TableCell value={day()}>
																		<DatePicker.TableCellTrigger
																			class={styles.cellTrigger}
																			asChild={(props) => (
																				<Button variant="ghost" {...props()} />
																			)}
																		>
																			{day().day}
																		</DatePicker.TableCellTrigger>
																	</DatePicker.TableCell>
																)}
															</Index>
														</DatePicker.TableRow>
													)}
												</Index>
											</DatePicker.TableBody>
										</DatePicker.Table>
									</>
								)}
							</DatePicker.Context>
						</DatePicker.View>

						<DatePicker.View view="month" class={styles.view}>
							<DatePicker.Context>
								{(context) => (
									<>
										<ViewControll />

										<DatePicker.Table>
											<DatePicker.TableBody>
												<Index
													each={context().getMonthsGrid({
														columns: 4,
														format: "short",
													})}
												>
													{(months) => (
														<DatePicker.TableRow>
															<Index each={months()}>
																{(month) => (
																	<DatePicker.TableCell value={month().value}>
																		<DatePicker.TableCellTrigger
																			class={styles.cellTrigger}
																			asChild={(props) => (
																				<Button variant="ghost" {...props()} />
																			)}
																		>
																			{month().label}
																		</DatePicker.TableCellTrigger>
																	</DatePicker.TableCell>
																)}
															</Index>
														</DatePicker.TableRow>
													)}
												</Index>
											</DatePicker.TableBody>
										</DatePicker.Table>
									</>
								)}
							</DatePicker.Context>
						</DatePicker.View>

						<DatePicker.View view="year" class={styles.view}>
							<DatePicker.Context>
								{(context) => (
									<>
										<ViewControll />

										<DatePicker.Table>
											<DatePicker.TableBody>
												<Index each={context().getYearsGrid({ columns: 4 })}>
													{(years) => (
														<DatePicker.TableRow>
															<Index each={years()}>
																{(year) => (
																	<DatePicker.TableCell value={year().value}>
																		<DatePicker.TableCellTrigger
																			class={styles.cellTrigger}
																			asChild={(props) => (
																				<Button variant="ghost" {...props()} />
																			)}
																		>
																			{year().label}
																		</DatePicker.TableCellTrigger>
																	</DatePicker.TableCell>
																)}
															</Index>
														</DatePicker.TableRow>
													)}
												</Index>
											</DatePicker.TableBody>
										</DatePicker.Table>
									</>
								)}
							</DatePicker.Context>
						</DatePicker.View>
					</DatePicker.Content>
				</DatePicker.Positioner>
			</Portal>
		</DatePicker.Root>
	);
}

function ViewControll() {
	return (
		<DatePicker.ViewControl class={styles.viewControl}>
			<DatePicker.PrevTrigger
				asChild={(props) => <Button variant="ghost" {...props()} />}
			>
				<ChevronLeft size={18} />
			</DatePicker.PrevTrigger>
			<DatePicker.ViewTrigger
				asChild={(props) => <Button variant="ghost" {...props()} />}
			>
				<DatePicker.RangeText />
			</DatePicker.ViewTrigger>
			<DatePicker.NextTrigger
				asChild={(props) => <Button variant="ghost" {...props()} />}
			>
				<ChevronRight size={18} />
			</DatePicker.NextTrigger>
		</DatePicker.ViewControl>
	);
}
